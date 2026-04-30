namespace Foodie.Api.Infrastructure;

public interface IBarcodeLookupService
{
    Task<BarcodeLookupFoodResult?> FindByBarcodeAsync(string barcode, CancellationToken cancellationToken);
}

public sealed record BarcodeLookupFoodResult(
    string Barcode,
    string Name,
    int Calories,
    int Protein,
    int Carbs,
    int Fat,
    string MealName);