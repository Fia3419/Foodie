namespace Foodie.Api.Entities;

public sealed class Recipe
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public int Servings { get; set; }

    public int CaloriesPerServing { get; set; }

    public int ProteinPerServing { get; set; }

    public int CarbsPerServing { get; set; }

    public int FatPerServing { get; set; }

    public string TagsJson { get; set; } = "[]";

    public string IngredientsJson { get; set; } = "[]";

    public string Instructions { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public FoodieUser? User { get; set; }
}