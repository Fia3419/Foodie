namespace Foodie.Api.Contracts;

public sealed record MealLogItemDto(
    string Id,
    string MealName,
    string FoodName,
    int Calories,
    int Protein,
    int Carbs,
    int Fat,
    string LoggedAt);

public sealed record DailyLogDto(string Date, IReadOnlyList<MealLogItemDto> Items);

public sealed record WeightEntryDto(string Date, decimal WeightKg);