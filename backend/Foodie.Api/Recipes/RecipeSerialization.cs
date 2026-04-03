using System.Text.Json;
using Foodie.Api.Contracts;

namespace Foodie.Api.Recipes;

public static class RecipeSerialization
{
    public static string SerializeIngredients(IReadOnlyList<RecipeIngredientDto> ingredients)
    {
        var items = ingredients.Select(ingredient => new RecipeIngredientRecord(
            ingredient.Name,
            ingredient.Amount,
            ingredient.Unit,
            ingredient.Calories,
            ingredient.Protein,
            ingredient.Carbs,
            ingredient.Fat));

        return JsonSerializer.Serialize(items);
    }

    public static IReadOnlyList<RecipeIngredientDto> DeserializeIngredients(string ingredientsJson)
    {
        if (string.IsNullOrWhiteSpace(ingredientsJson))
        {
            return [];
        }

        try
        {
            var detailedItems = JsonSerializer.Deserialize<List<RecipeIngredientRecord>>(ingredientsJson);
            if (detailedItems is not null)
            {
                return detailedItems.Select(ToDto).ToList();
            }
        }
        catch (JsonException)
        {
        }

        try
        {
            var legacyItems = JsonSerializer.Deserialize<List<string>>(ingredientsJson) ?? [];
            return legacyItems.Select(name => new RecipeIngredientDto(name, 0, string.Empty, 0, 0, 0, 0)).ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static RecipeIngredientDto ToDto(RecipeIngredientRecord ingredient)
    {
        return new RecipeIngredientDto(
            ingredient.Name,
            ingredient.Amount,
            ingredient.Unit,
            ingredient.Calories,
            ingredient.Protein,
            ingredient.Carbs,
            ingredient.Fat);
    }
}