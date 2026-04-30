namespace Foodie.Api.Entities;

public sealed class SavedFood
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Kind { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string MealName { get; set; } = string.Empty;

    public string? Barcode { get; set; }

    public int Calories { get; set; }

    public int Protein { get; set; }

    public int Carbs { get; set; }

    public int Fat { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public FoodieUser User { get; set; } = null!;
}