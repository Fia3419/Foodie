using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record CreateMealLogEntryRequestDto(
    [Required, StringLength(50, MinimumLength = 2)] string MealName,
    [Required, StringLength(200, MinimumLength = 2)] string FoodName,
    [Range(0, 10000)] int Calories,
    [Range(0, 1000)] int Protein,
    [Range(0, 1000)] int Carbs,
    [Range(0, 1000)] int Fat,
    [Required, RegularExpression("^\\d{4}-\\d{2}-\\d{2}$")] string LogDate,
    [Required, RegularExpression("^\\d{2}:\\d{2}$")] string LoggedAt,
    [StringLength(64)] string? ClientMutationId);

public sealed record UpdateMealLogEntryRequestDto(
    [Required, StringLength(50, MinimumLength = 2)] string MealName,
    [Required, StringLength(200, MinimumLength = 2)] string FoodName,
    [Range(0, 10000)] int Calories,
    [Range(0, 1000)] int Protein,
    [Range(0, 1000)] int Carbs,
    [Range(0, 1000)] int Fat,
    [Required, RegularExpression("^\\d{4}-\\d{2}-\\d{2}$")] string LogDate,
    [Required, RegularExpression("^\\d{2}:\\d{2}$")] string LoggedAt);

public sealed record CreateWeightEntryRequestDto(
    [Required, RegularExpression("^\\d{4}-\\d{2}-\\d{2}$")] string Date,
    [Range(typeof(decimal), "0", "1000")] decimal WeightKg,
    [StringLength(64)] string? ClientMutationId);

public sealed record UpdateGoalModeRequestDto([Required] string GoalMode);