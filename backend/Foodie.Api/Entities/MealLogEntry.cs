namespace Foodie.Api.Entities;

public sealed class MealLogEntry
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string MealName { get; set; } = string.Empty;

    public string FoodName { get; set; } = string.Empty;

    public int Calories { get; set; }

    public int Protein { get; set; }

    public int Carbs { get; set; }

    public int Fat { get; set; }

    public DateOnly LogDate { get; set; }

    public string LoggedAt { get; set; } = string.Empty;

    public string? ClientMutationId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public FoodieUser User { get; set; } = null!;
}