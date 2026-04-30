namespace Foodie.Api.Contracts;

public sealed record NutritionSearchResultDto(int FoodNumber, string Name);

public sealed record NutritionMacrosDto(
    string Name,
    int FoodNumber,
    int Grams,
    int Calories,
    int Protein,
    int Carbs,
    int Fat);
