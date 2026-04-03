namespace Foodie.Api.Entities;

public sealed class FoodieUser
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string SelectedGoalMode { get; set; } = "gain-strength";

    public DateTime CreatedAtUtc { get; set; }

    public List<MealLogEntry> MealLogEntries { get; set; } = [];

    public List<WeightLogEntry> WeightLogEntries { get; set; } = [];

    public List<Recipe> Recipes { get; set; } = [];

    public List<RefreshToken> RefreshTokens { get; set; } = [];
}