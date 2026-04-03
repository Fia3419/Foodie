using System.Text.Json;
using Foodie.Api.Contracts;
using Foodie.Api.Entities;
using Foodie.Api.Recipes;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(FoodieDbContext dbContext)
    {
        if (await dbContext.Recipes.AnyAsync(recipe => recipe.UserId == null))
        {
            return;
        }

        var recipes = new[]
        {
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "High-protein overnight oats",
                Servings = 2,
                CaloriesPerServing = 390,
                ProteinPerServing = 29,
                TagsJson = JsonSerializer.Serialize(new[] { "Breakfast", "Prep-friendly" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Oats", 80, "g", 300, 10, 49, 6),
                        new RecipeIngredientDto("Skyr", 200, "g", 120, 22, 8, 0),
                        new RecipeIngredientDto("Berries", 100, "g", 45, 1, 10, 0),
                        new RecipeIngredientDto("Chia seeds", 10, "g", 49, 2, 4, 3)
                    ]),
                Instructions = "Mix everything in a jar, chill overnight, and serve cold.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Turkey taco skillet",
                Servings = 4,
                CaloriesPerServing = 510,
                ProteinPerServing = 42,
                TagsJson = JsonSerializer.Serialize(new[] { "Dinner", "Strength" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Turkey mince", 500, "g", 675, 105, 0, 25),
                        new RecipeIngredientDto("Beans", 240, "g", 220, 14, 40, 1),
                        new RecipeIngredientDto("Tomato", 400, "g", 72, 4, 15, 1),
                        new RecipeIngredientDto("Spices", 10, "g", 12, 0, 2, 0)
                    ]),
                Instructions = "Brown the turkey, add remaining ingredients, and simmer until thick.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Mediterranean chickpea salad",
                Servings = 3,
                CaloriesPerServing = 330,
                ProteinPerServing = 17,
                TagsJson = JsonSerializer.Serialize(new[] { "Lunch", "Weight loss" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Chickpeas", 240, "g", 394, 21, 66, 6),
                        new RecipeIngredientDto("Cucumber", 150, "g", 23, 1, 5, 0),
                        new RecipeIngredientDto("Tomatoes", 150, "g", 27, 1, 6, 0),
                        new RecipeIngredientDto("Feta", 80, "g", 212, 11, 3, 17)
                    ]),
                Instructions = "Combine chopped vegetables and chickpeas, then dress lightly before serving.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            }
        };

        await dbContext.Recipes.AddRangeAsync(recipes);
        await dbContext.SaveChangesAsync();
    }
}