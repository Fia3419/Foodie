namespace Foodie.Api.Infrastructure;

public sealed record NutritionSearchResult(int FoodNumber, string Name);

public sealed record NutritionMacros(
    string Name,
    int FoodNumber,
    decimal CaloriesPerHundredGrams,
    decimal ProteinPerHundredGrams,
    decimal CarbsPerHundredGrams,
    decimal FatPerHundredGrams);

public interface INutritionLookupService
{
    Task<IReadOnlyList<NutritionSearchResult>> SearchAsync(string query, CancellationToken cancellationToken);

    Task<NutritionMacros?> GetMacrosAsync(int foodNumber, CancellationToken cancellationToken);
}
