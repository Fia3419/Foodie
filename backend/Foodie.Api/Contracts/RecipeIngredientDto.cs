using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record RecipeIngredientDto(
    [Required, StringLength(120, MinimumLength = 1)] string Name,
    [Range(0, 10000)] decimal Amount,
    [StringLength(40)] string Unit,
    [Range(0, 10000)] int Calories,
    [Range(0, 1000)] int Protein,
    [Range(0, 1000)] int Carbs,
    [Range(0, 1000)] int Fat);