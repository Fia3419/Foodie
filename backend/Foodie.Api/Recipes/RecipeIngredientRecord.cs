namespace Foodie.Api.Recipes;

public sealed record RecipeIngredientRecord(
    string Name,
    decimal Amount,
    string Unit,
    int Calories,
    int Protein,
    int Carbs,
    int Fat);