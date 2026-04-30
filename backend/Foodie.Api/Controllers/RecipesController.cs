using System.Security.Claims;
using System.Text.Json;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Foodie.Api.Entities;
using Foodie.Api.Infrastructure;
using Foodie.Api.Localization;
using Foodie.Api.Recipes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Controllers;

[ApiController]
[Route("api/recipes")]
[Authorize]
public sealed class RecipesController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;
    private readonly IApiTextLocalizer _localizer;
    private readonly INutritionLookupService _nutritionLookup;
    private readonly IRecipeImportService _recipeImport;

    public RecipesController(
        FoodieDbContext dbContext,
        IApiTextLocalizer localizer,
        INutritionLookupService nutritionLookup,
        IRecipeImportService recipeImport)
    {
        _dbContext = dbContext;
        _localizer = localizer;
        _nutritionLookup = nutritionLookup;
        _recipeImport = recipeImport;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RecipeSummaryDto>>> Get(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var recipes = await _dbContext.Recipes
            .AsNoTracking()
            .Where(recipe => recipe.UserId == null || recipe.UserId == userId)
            .OrderBy(recipe => recipe.Name)
            .ToListAsync(cancellationToken);

        IReadOnlyList<RecipeSummaryDto> items = recipes
            .Select(recipe => ToDto(recipe, userId))
            .ToList();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeSummaryDto>> Create(UpsertRecipeRequestDto request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var recipe = new Recipe
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name.Trim(),
            Servings = request.Servings,
            CaloriesPerServing = request.CaloriesPerServing,
            ProteinPerServing = request.ProteinPerServing,
            CarbsPerServing = request.CarbsPerServing,
            FatPerServing = request.FatPerServing,
            TagsJson = JsonSerializer.Serialize(request.Tags),
            IngredientsJson = RecipeSerialization.SerializeIngredients(request.Ingredients),
            Instructions = request.Instructions.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Recipes.Add(recipe);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(recipe, userId));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RecipeSummaryDto>> Update(Guid id, UpsertRecipeRequestDto request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var recipe = await _dbContext.Recipes.SingleOrDefaultAsync(entity => entity.Id == id && entity.UserId == userId, cancellationToken);

        if (recipe is null)
        {
            return NotFound(new ApiMessageDto(_localizer.Get(ApiTextKey.RecipeNotFound)));
        }

        recipe.Name = request.Name.Trim();
        recipe.Servings = request.Servings;
        recipe.CaloriesPerServing = request.CaloriesPerServing;
        recipe.ProteinPerServing = request.ProteinPerServing;
        recipe.CarbsPerServing = request.CarbsPerServing;
        recipe.FatPerServing = request.FatPerServing;
        recipe.TagsJson = JsonSerializer.Serialize(request.Tags);
        recipe.IngredientsJson = RecipeSerialization.SerializeIngredients(request.Ingredients);
        recipe.Instructions = request.Instructions.Trim();
        recipe.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(recipe, userId));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiMessageDto>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var recipe = await _dbContext.Recipes.SingleOrDefaultAsync(entity => entity.Id == id && entity.UserId == userId, cancellationToken);

        if (recipe is null)
        {
            return NotFound(new ApiMessageDto(_localizer.Get(ApiTextKey.RecipeNotFound)));
        }

        _dbContext.Recipes.Remove(recipe);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiMessageDto(_localizer.Get(ApiTextKey.RecipeDeleted)));
    }

    [HttpGet("nutrition/search")]
    public async Task<ActionResult<IReadOnlyList<NutritionSearchResultDto>>> SearchNutrition(
        [FromQuery] string query,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Ok(Array.Empty<NutritionSearchResultDto>());
        }

        var results = await _nutritionLookup.SearchAsync(query.Trim(), cancellationToken);
        IReadOnlyList<NutritionSearchResultDto> response = results
            .Select(item => new NutritionSearchResultDto(item.FoodNumber, item.Name))
            .ToList();

        return Ok(response);
    }

    [HttpGet("nutrition/{foodNumber:int}")]
    public async Task<ActionResult<NutritionMacrosDto>> GetNutrition(
        int foodNumber,
        [FromQuery] int grams,
        CancellationToken cancellationToken)
    {
        if (grams <= 0 || grams > 5000)
        {
            return BadRequest(new ApiMessageDto(_localizer.Get(ApiTextKey.ValidationFailedDetail)));
        }

        var macros = await _nutritionLookup.GetMacrosAsync(foodNumber, cancellationToken);

        if (macros is null)
        {
            return NotFound();
        }

        var factor = grams / 100m;
        return Ok(new NutritionMacrosDto(
            macros.Name,
            macros.FoodNumber,
            grams,
            (int)Math.Round(macros.CaloriesPerHundredGrams * factor, MidpointRounding.AwayFromZero),
            (int)Math.Round(macros.ProteinPerHundredGrams * factor, MidpointRounding.AwayFromZero),
            (int)Math.Round(macros.CarbsPerHundredGrams * factor, MidpointRounding.AwayFromZero),
            (int)Math.Round(macros.FatPerHundredGrams * factor, MidpointRounding.AwayFromZero)));
    }

    [HttpPost("import")]
    public async Task<ActionResult<IReadOnlyList<RecipeSummaryDto>>> ImportRecipes(
        ImportRecipesRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!_recipeImport.IsConfigured)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new ApiMessageDto("Recipe import service is not configured."));
        }

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var imported = await _recipeImport.SearchAsync(
            request.Query.Trim(),
            request.Count,
            request.TranslateToSwedish,
            cancellationToken);

        if (imported.Count == 0)
        {
            return Ok(Array.Empty<RecipeSummaryDto>());
        }

        var savedRecipes = CreateImportedRecipes(imported, userId);

        if (savedRecipes.Count == 0)
        {
            return Ok(Array.Empty<RecipeSummaryDto>());
        }

        await _dbContext.Recipes.AddRangeAsync(savedRecipes, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        IReadOnlyList<RecipeSummaryDto> response = savedRecipes
            .Select(recipe => ToDto(recipe, userId))
            .ToList();

        return Ok(response);
    }

    private static IReadOnlyList<Recipe> CreateImportedRecipes(IReadOnlyList<ImportedRecipe> imported, Guid userId)
    {
        var now = DateTime.UtcNow;

        return imported
            .Where(item => !string.IsNullOrWhiteSpace(item.Name))
            .Select(item => new Recipe
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = Truncate(item.Name, 120),
                Servings = item.Servings,
                CaloriesPerServing = item.CaloriesPerServing,
                ProteinPerServing = item.ProteinPerServing,
                CarbsPerServing = item.CarbsPerServing,
                FatPerServing = item.FatPerServing,
                TagsJson = JsonSerializer.Serialize(item.Tags),
                IngredientsJson = RecipeSerialization.SerializeIngredients(item.Ingredients),
                Instructions = Truncate(item.Instructions, 5000),
                CreatedAtUtc = now,
                UpdatedAtUtc = now,
            })
            .ToList();
    }

    private static string Truncate(string value, int maxLength)
        => value.Length <= maxLength ? value : value[..maxLength];

    private static RecipeSummaryDto ToDto(Recipe recipe, Guid userId)
    {
        return new RecipeSummaryDto(
            recipe.Id.ToString(),
            recipe.Name,
            recipe.Servings,
            recipe.CaloriesPerServing,
            recipe.ProteinPerServing,
            recipe.CarbsPerServing,
            recipe.FatPerServing,
            JsonSerializer.Deserialize<List<string>>(recipe.TagsJson) ?? [],
            RecipeSerialization.DeserializeIngredients(recipe.IngredientsJson),
            recipe.Instructions,
            recipe.UserId == userId);
    }
}