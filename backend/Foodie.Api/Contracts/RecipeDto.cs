using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record RecipeSummaryDto(
    string Id,
    string Name,
    int Servings,
    int CaloriesPerServing,
    int ProteinPerServing,
    int CarbsPerServing,
    int FatPerServing,
    IReadOnlyList<string> Tags,
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    string Instructions,
    bool IsOwnedByCurrentUser);

public sealed record UpsertRecipeRequestDto(
    [Required, StringLength(120, MinimumLength = 2)] string Name,
    [Range(1, 50)] int Servings,
    [Range(0, 10000)] int CaloriesPerServing,
    [Range(0, 1000)] int ProteinPerServing,
    [Range(0, 1000)] int CarbsPerServing,
    [Range(0, 1000)] int FatPerServing,
    IReadOnlyList<string> Tags,
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    [StringLength(5000)] string Instructions);

public sealed record ImportRecipesRequestDto(
    [Required, StringLength(200, MinimumLength = 2)] string Query,
    [Range(1, 20)] int Count = 5,
    bool TranslateToSwedish = true);