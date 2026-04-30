using System.Text.Json;
using System.Text.Json.Serialization;

namespace Foodie.Api.Infrastructure;

public sealed class OpenFoodFactsBarcodeLookupService : IBarcodeLookupService
{
    private readonly HttpClient _httpClient;

    public OpenFoodFactsBarcodeLookupService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<BarcodeLookupFoodResult?> FindByBarcodeAsync(string barcode, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.GetAsync(
            $"api/v2/product/{Uri.EscapeDataString(barcode)}.json?fields=code,product_name,product_name_en,nutriments",
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var payload = await JsonSerializer.DeserializeAsync<OpenFoodFactsResponse>(responseStream, cancellationToken: cancellationToken);

        if (payload?.Product is null)
        {
            return null;
        }

        var name = FirstNonEmpty(payload.Product.ProductName, payload.Product.ProductNameEn);

        if (string.IsNullOrWhiteSpace(name))
        {
            return null;
        }

        return new BarcodeLookupFoodResult(
            payload.Code ?? barcode,
            name.Trim(),
            RoundNutrition(payload.Product.Nutriments?.EnergyKcal100g),
            RoundNutrition(payload.Product.Nutriments?.Proteins100g),
            RoundNutrition(payload.Product.Nutriments?.Carbohydrates100g),
            RoundNutrition(payload.Product.Nutriments?.Fat100g),
            "Snack");
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        return values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
    }

    private static int RoundNutrition(decimal? value)
    {
        if (!value.HasValue)
        {
            return 0;
        }

        return (int)Math.Round(value.Value, MidpointRounding.AwayFromZero);
    }

    private sealed class OpenFoodFactsResponse
    {
        [JsonPropertyName("code")]
        public string? Code { get; init; }

        [JsonPropertyName("product")]
        public OpenFoodFactsProduct? Product { get; init; }
    }

    private sealed class OpenFoodFactsProduct
    {
        [JsonPropertyName("product_name")]
        public string? ProductName { get; init; }

        [JsonPropertyName("product_name_en")]
        public string? ProductNameEn { get; init; }

        [JsonPropertyName("nutriments")]
        public OpenFoodFactsNutriments? Nutriments { get; init; }
    }

    private sealed class OpenFoodFactsNutriments
    {
        [JsonPropertyName("energy-kcal_100g")]
        public decimal? EnergyKcal100g { get; init; }

        [JsonPropertyName("proteins_100g")]
        public decimal? Proteins100g { get; init; }

        [JsonPropertyName("carbohydrates_100g")]
        public decimal? Carbohydrates100g { get; init; }

        [JsonPropertyName("fat_100g")]
        public decimal? Fat100g { get; init; }
    }
}