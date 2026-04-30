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
        var existingNames = await dbContext.Recipes
            .Where(recipe => recipe.UserId == null)
            .Select(recipe => recipe.Name)
            .ToListAsync();

        var existingSet = new HashSet<string>(existingNames, StringComparer.OrdinalIgnoreCase);

        var recipes = new[]
        {
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "High-protein overnight oats",
                Servings = 2,
                CaloriesPerServing = 390,
                ProteinPerServing = 29,
                CarbsPerServing = 36,
                FatPerServing = 5,
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
                CarbsPerServing = 14,
                FatPerServing = 7,
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
                CarbsPerServing = 27,
                FatPerServing = 8,
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
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Kvargpannkakor med bär",
                Servings = 1,
                CaloriesPerServing = 380,
                ProteinPerServing = 38,
                CarbsPerServing = 42,
                FatPerServing = 8,
                TagsJson = JsonSerializer.Serialize(new[] { "Frukost", "Proteinrik", "Snabb" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Kvarg, naturell", 200, "g", 132, 22, 7, 0),
                        new RecipeIngredientDto("Havregryn", 40, "g", 150, 5, 24, 3),
                        new RecipeIngredientDto("Ägg", 50, "g", 72, 6, 0, 5),
                        new RecipeIngredientDto("Blåbär", 80, "g", 46, 1, 11, 0)
                    ]),
                Instructions = "Mixa kvarg, havregryn och ägg till en slät smet. Stek små pannkakor i smör eller kokosolja. Toppa med blåbär.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Kycklinggryta med röda linser",
                Servings = 4,
                CaloriesPerServing = 470,
                ProteinPerServing = 45,
                CarbsPerServing = 41,
                FatPerServing = 4,
                TagsJson = JsonSerializer.Serialize(new[] { "Middag", "Proteinrik", "Meal prep" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Kycklingfilé", 600, "g", 660, 138, 0, 12),
                        new RecipeIngredientDto("Röda linser, torkade", 200, "g", 700, 50, 120, 4),
                        new RecipeIngredientDto("Krossade tomater", 400, "g", 116, 6, 24, 1),
                        new RecipeIngredientDto("Lök", 150, "g", 60, 2, 14, 0),
                        new RecipeIngredientDto("Curry- och kryddor", 15, "g", 30, 1, 5, 1)
                    ]),
                Instructions = "Stek tärnad kyckling och hackad lök. Tillsätt kryddor, krossade tomater och sköljda linser. Sjud i 20 minuter tills linserna är mjuka.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Ugnsbakad lax med quinoa",
                Servings = 2,
                CaloriesPerServing = 540,
                ProteinPerServing = 42,
                CarbsPerServing = 47,
                FatPerServing = 25,
                TagsJson = JsonSerializer.Serialize(new[] { "Middag", "Omega-3", "Proteinrik" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Laxfilé", 300, "g", 624, 60, 0, 42),
                        new RecipeIngredientDto("Quinoa, torr", 120, "g", 442, 17, 76, 7),
                        new RecipeIngredientDto("Broccoli", 200, "g", 70, 6, 14, 1),
                        new RecipeIngredientDto("Citron", 30, "g", 9, 0, 3, 0)
                    ]),
                Instructions = "Ugnsbaka lax med citron i 200°C i 12-15 minuter. Koka quinoa enligt anvisning. Ångkoka broccolin och servera tillsammans.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Svensk köttfärslimpa med rotsaker",
                Servings = 4,
                CaloriesPerServing = 510,
                ProteinPerServing = 40,
                CarbsPerServing = 36,
                FatPerServing = 18,
                TagsJson = JsonSerializer.Serialize(new[] { "Middag", "Husmanskost", "Proteinrik" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Nötfärs 10%", 600, "g", 1020, 120, 0, 60),
                        new RecipeIngredientDto("Ägg", 100, "g", 144, 12, 0, 10),
                        new RecipeIngredientDto("Ströbröd", 60, "g", 230, 8, 45, 2),
                        new RecipeIngredientDto("Lök", 100, "g", 40, 1, 9, 0),
                        new RecipeIngredientDto("Morötter", 200, "g", 82, 2, 19, 0),
                        new RecipeIngredientDto("Potatis", 400, "g", 308, 8, 70, 0)
                    ]),
                Instructions = "Blanda färs, ägg, ströbröd och hackad lök. Forma en limpa och baka i 200°C i 35-40 minuter tillsammans med tärnade rotsaker.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Tonfiskröra på Wasa",
                Servings = 1,
                CaloriesPerServing = 320,
                ProteinPerServing = 32,
                CarbsPerServing = 30,
                FatPerServing = 4,
                TagsJson = JsonSerializer.Serialize(new[] { "Lunch", "Snabb", "Proteinrik" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Tonfisk i vatten", 120, "g", 132, 30, 0, 1),
                        new RecipeIngredientDto("Lättcrème fraiche", 30, "g", 30, 1, 2, 2),
                        new RecipeIngredientDto("Wasa knäckebröd", 40, "g", 132, 4, 26, 1),
                        new RecipeIngredientDto("Gurka", 60, "g", 9, 0, 2, 0)
                    ]),
                Instructions = "Blanda avrunnen tonfisk med crème fraiche och kryddor. Bred på knäckebröd och toppa med gurka.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            },
            new Recipe
            {
                Id = Guid.NewGuid(),
                Name = "Proteinpasta med kycklingfärs",
                Servings = 3,
                CaloriesPerServing = 560,
                ProteinPerServing = 48,
                CarbsPerServing = 44,
                FatPerServing = 13,
                TagsJson = JsonSerializer.Serialize(new[] { "Middag", "Meal prep", "Proteinrik" }),
                IngredientsJson = RecipeSerialization.SerializeIngredients(
                    [
                        new RecipeIngredientDto("Kycklingfärs", 500, "g", 720, 110, 0, 30),
                        new RecipeIngredientDto("Proteinpasta, torr", 200, "g", 720, 50, 100, 6),
                        new RecipeIngredientDto("Krossade tomater", 400, "g", 116, 6, 24, 1),
                        new RecipeIngredientDto("Spenat", 100, "g", 23, 3, 4, 0),
                        new RecipeIngredientDto("Vitlök", 10, "g", 15, 1, 3, 0)
                    ]),
                Instructions = "Stek färsen, tillsätt vitlök, krossade tomater och spenat. Koka pastan al dente. Blanda och servera med riven parmesan om så önskas.",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            }
        };

        var newRecipes = recipes
            .Where(recipe => !existingSet.Contains(recipe.Name))
            .ToList();

        if (newRecipes.Count == 0)
        {
            return;
        }

        await dbContext.Recipes.AddRangeAsync(newRecipes);
        await dbContext.SaveChangesAsync();
    }
}