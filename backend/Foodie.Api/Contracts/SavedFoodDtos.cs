using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record SavedFoodDto(
    string Id,
    string Kind,
    string Name,
    string MealName,
    string? Barcode,
    int Calories,
    int Protein,
    int Carbs,
    int Fat,
    bool IsSaved);

public sealed record UpsertSavedFoodRequestDto(
    [Required, StringLength(20, MinimumLength = 1)] string Kind,
    [Required, StringLength(200, MinimumLength = 2)] string Name,
    [Required, StringLength(50, MinimumLength = 2)] string MealName,
    [StringLength(64)] string? Barcode,
    [Range(0, 10000)] int Calories,
    [Range(0, 1000)] int Protein,
    [Range(0, 1000)] int Carbs,
    [Range(0, 1000)] int Fat);