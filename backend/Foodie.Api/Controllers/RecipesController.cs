using System.Security.Claims;
using System.Text.Json;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Foodie.Api.Entities;
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

    public RecipesController(FoodieDbContext dbContext, IApiTextLocalizer localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;
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

    private static RecipeSummaryDto ToDto(Recipe recipe, Guid userId)
    {
        return new RecipeSummaryDto(
            recipe.Id.ToString(),
            recipe.Name,
            recipe.Servings,
            recipe.CaloriesPerServing,
            recipe.ProteinPerServing,
            JsonSerializer.Deserialize<List<string>>(recipe.TagsJson) ?? [],
            RecipeSerialization.DeserializeIngredients(recipe.IngredientsJson),
            recipe.Instructions,
            recipe.UserId == userId);
    }
}