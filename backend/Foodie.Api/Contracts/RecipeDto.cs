using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record RecipeSummaryDto(
    string Id,
    string Name,
    int Servings,
    int CaloriesPerServing,
    int ProteinPerServing,
    IReadOnlyList<string> Tags,
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    string Instructions,
    bool IsOwnedByCurrentUser);

public sealed record UpsertRecipeRequestDto(
    [Required, StringLength(120, MinimumLength = 2)] string Name,
    [Range(1, 50)] int Servings,
    [Range(0, 10000)] int CaloriesPerServing,
    [Range(0, 1000)] int ProteinPerServing,
    IReadOnlyList<string> Tags,
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    [StringLength(5000)] string Instructions);