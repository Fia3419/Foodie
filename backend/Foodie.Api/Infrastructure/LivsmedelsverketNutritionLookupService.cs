using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Foodie.Api.Infrastructure;

/// <summary>
/// Looks up nutrition data from the Swedish Food Agency (Livsmedelsverket) open data API.
/// The upstream API does not support server-side text search, so the catalogue is cached
/// in memory at first use and searched locally.
/// Reference: https://dataportal.livsmedelsverket.se/
/// </summary>
public sealed class LivsmedelsverketNutritionLookupService : INutritionLookupService
{
    private static readonly SemaphoreSlim CatalogueLock = new(1, 1);
    private static readonly TimeSpan FailureBackoff = TimeSpan.FromSeconds(30);
    private static IReadOnlyList<CachedFood>? _catalogue;
    private static DateTime _lastFailedLoadUtc = DateTime.MinValue;
    private static readonly ConcurrentDictionary<int, NutritionMacros> MacrosCache = new();

    private readonly HttpClient _httpClient;

    public LivsmedelsverketNutritionLookupService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IReadOnlyList<NutritionSearchResult>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var catalogue = await GetCatalogueAsync(cancellationToken);
        var terms = query
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(term => term.Length > 0)
            .ToArray();

        if (terms.Length == 0)
        {
            return [];
        }

        return catalogue
            .Where(food => terms.All(term => MatchesTerm(food.Name, term)))
            .OrderBy(food => food.Name.Length)
            .ThenBy(food => food.Name, StringComparer.OrdinalIgnoreCase)
            .Take(20)
            .Select(food => new NutritionSearchResult(food.FoodNumber, food.Name))
            .ToList();
    }

    /// <summary>
    /// Matches a search term against a food name. Supports compound Swedish words
    /// such as "kycklingfilé" by also trying every split of the term into two parts
    /// of at least three characters each, since Livsmedelsverket frequently writes
    /// composites with spaces (e.g. "Kyckling bröstfilé").
    /// </summary>
    private static bool MatchesTerm(string name, string term)
    {
        if (term.Length < 2)
        {
            return false;
        }

        if (name.Contains(term, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (term.Length < 6)
        {
            return false;
        }

        for (var splitPos = 3; splitPos <= term.Length - 3; splitPos++)
        {
            var left = term.AsSpan(0, splitPos);
            var right = term.AsSpan(splitPos);

            if (name.AsSpan().Contains(left, StringComparison.OrdinalIgnoreCase)
                && name.AsSpan().Contains(right, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    public async Task<NutritionMacros?> GetMacrosAsync(int foodNumber, CancellationToken cancellationToken)
    {
        if (MacrosCache.TryGetValue(foodNumber, out var cached))
        {
            return cached;
        }

        using var response = await _httpClient.GetAsync(
            $"livsmedel/{foodNumber}/naringsvarden?sprak=1",
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var values = await JsonSerializer.DeserializeAsync<List<NaringsvardeItem>>(stream, cancellationToken: cancellationToken)
            ?? [];

        var calories = ReadValue(values, "Energi (kcal)");
        var protein = ReadValue(values, "Protein");
        var carbs = ReadValue(values, "Kolhydrater, tillgängliga", "Kolhydrater");
        var fat = ReadValue(values, "Fett, totalt", "Fett");

        var catalogue = await GetCatalogueAsync(cancellationToken);
        var name = catalogue.FirstOrDefault(food => food.FoodNumber == foodNumber)?.Name ?? string.Empty;

        var macros = new NutritionMacros(name, foodNumber, calories, protein, carbs, fat);
        MacrosCache[foodNumber] = macros;
        return macros;
    }

    private async Task<IReadOnlyList<CachedFood>> GetCatalogueAsync(CancellationToken cancellationToken)
    {
        if (_catalogue is { } existing)
        {
            return existing;
        }

        if (DateTime.UtcNow - _lastFailedLoadUtc < FailureBackoff)
        {
            return [];
        }

        await CatalogueLock.WaitAsync(cancellationToken);

        try
        {
            if (_catalogue is { } existingAfterLock)
            {
                return existingAfterLock;
            }

            if (DateTime.UtcNow - _lastFailedLoadUtc < FailureBackoff)
            {
                return [];
            }

            return await LoadCatalogueAsync(cancellationToken);
        }
        finally
        {
            CatalogueLock.Release();
        }
    }

    private async Task<IReadOnlyList<CachedFood>> LoadCatalogueAsync(CancellationToken cancellationToken)
    {
        var result = await ReadCatalogueAsync(cancellationToken);

        if (result.Completed)
        {
            _catalogue = result.Foods;
        }
        else
        {
            _lastFailedLoadUtc = DateTime.UtcNow;
        }

        return result.Foods;
    }

    private async Task<CatalogueLoadResult> ReadCatalogueAsync(CancellationToken cancellationToken)
    {
        var foods = new List<CachedFood>(capacity: 3000);
        var offset = 0;
        const int pageSize = 500;

        while (true)
        {
            var page = await ReadCataloguePageAsync(offset, pageSize, cancellationToken);

            if (page is null)
            {
                return new CatalogueLoadResult(foods, Completed: false);
            }

            if (page.Foods.Count == 0)
            {
                return new CatalogueLoadResult(foods, Completed: foods.Count > 0);
            }

            foods.AddRange(page.Foods);

            if (page.IsLastPage)
            {
                return new CatalogueLoadResult(foods, Completed: true);
            }

            offset += pageSize;
        }
    }

    private async Task<CataloguePage?> ReadCataloguePageAsync(
        int offset,
        int pageSize,
        CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync(
            $"livsmedel?offset={offset}&limit={pageSize}&sprak=1",
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var page = await JsonSerializer.DeserializeAsync<LivsmedelListResponse>(stream, cancellationToken: cancellationToken);
        var items = page?.Livsmedel ?? [];
        var foods = items
            .Where(item => item.Nummer.HasValue && !string.IsNullOrWhiteSpace(item.Namn))
            .Select(item => new CachedFood(item.Nummer!.Value, item.Namn!.Trim()))
            .ToList();

        return new CataloguePage(foods, items.Count < pageSize);
    }

    private static decimal ReadValue(IReadOnlyList<NaringsvardeItem> values, params string[] candidateNames)
    {
        foreach (var candidate in candidateNames)
        {
            var match = values.FirstOrDefault(item =>
                string.Equals(item.Namn, candidate, StringComparison.OrdinalIgnoreCase));

            if (match is not null)
            {
                return (decimal)match.Varde;
            }
        }

        return 0m;
    }

    private sealed record CachedFood(int FoodNumber, string Name);

    private sealed record CatalogueLoadResult(IReadOnlyList<CachedFood> Foods, bool Completed);

    private sealed record CataloguePage(IReadOnlyList<CachedFood> Foods, bool IsLastPage);

    private sealed class LivsmedelListResponse
    {
        [JsonPropertyName("livsmedel")]
        public List<LivsmedelItem>? Livsmedel { get; init; }
    }

    private sealed class LivsmedelItem
    {
        [JsonPropertyName("nummer")]
        public int? Nummer { get; init; }

        [JsonPropertyName("namn")]
        public string? Namn { get; init; }
    }

    private sealed class NaringsvardeItem
    {
        [JsonPropertyName("namn")]
        public string? Namn { get; init; }

        [JsonPropertyName("varde")]
        public double Varde { get; init; }

        [JsonPropertyName("enhet")]
        public string? Enhet { get; init; }
    }
}
