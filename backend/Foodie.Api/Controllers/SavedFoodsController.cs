using System.Security.Claims;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Foodie.Api.Entities;
using Foodie.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Controllers;

[ApiController]
[Route("api/saved-foods")]
[Authorize]
public sealed class SavedFoodsController : ControllerBase
{
    private static readonly HashSet<string> AllowedKinds =
    [
        "favorite",
        "template",
        "packaged"
    ];

    private readonly FoodieDbContext _dbContext;
    private readonly IBarcodeLookupService _barcodeLookupService;

    public SavedFoodsController(FoodieDbContext dbContext, IBarcodeLookupService barcodeLookupService)
    {
        _dbContext = dbContext;
        _barcodeLookupService = barcodeLookupService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SavedFoodDto>>> Get(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var items = await _dbContext.SavedFoods
            .AsNoTracking()
            .Where(savedFood => savedFood.UserId == userId)
            .OrderBy(savedFood => savedFood.Kind)
            .ThenBy(savedFood => savedFood.Name)
            .Select(savedFood => new SavedFoodDto(
                savedFood.Id.ToString(),
                savedFood.Kind,
                savedFood.Name,
                savedFood.MealName,
                savedFood.Barcode,
                savedFood.Calories,
                savedFood.Protein,
                savedFood.Carbs,
                savedFood.Fat,
                true))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<ActionResult<SavedFoodDto>> GetByBarcode(string barcode, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var normalizedBarcode = NormalizeBarcode(barcode);

        if (string.IsNullOrWhiteSpace(normalizedBarcode))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(barcode)] = ["Barcode is required."]
            }));
        }

        var item = await _dbContext.SavedFoods
            .AsNoTracking()
            .FirstOrDefaultAsync(savedFood => savedFood.UserId == userId && savedFood.Barcode == normalizedBarcode, cancellationToken);

        return item is null ? NotFound() : Ok(ToDto(item));
    }

    [HttpGet("barcode/{barcode}/lookup")]
    public async Task<ActionResult<SavedFoodDto>> LookupByBarcode(string barcode, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var normalizedBarcode = NormalizeBarcode(barcode);

        if (string.IsNullOrWhiteSpace(normalizedBarcode))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(barcode)] = ["Barcode is required."]
            }));
        }

        var localItem = await _dbContext.SavedFoods
            .AsNoTracking()
            .FirstOrDefaultAsync(savedFood => savedFood.UserId == userId && savedFood.Barcode == normalizedBarcode, cancellationToken);

        if (localItem is not null)
        {
            return Ok(ToDto(localItem));
        }

        var externalItem = await _barcodeLookupService.FindByBarcodeAsync(normalizedBarcode, cancellationToken);

        if (externalItem is null)
        {
            return NotFound();
        }

        return Ok(ToDto(externalItem));
    }

    [HttpPost]
    public async Task<ActionResult<SavedFoodDto>> CreateOrUpdate(UpsertSavedFoodRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var normalizedKind = request.Kind.Trim().ToLowerInvariant();

        if (!AllowedKinds.Contains(normalizedKind))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(request.Kind)] = ["Kind must be favorite, template, or packaged."]
            }));
        }

        var normalizedBarcode = NormalizeBarcode(request.Barcode);
        var existing = normalizedBarcode is null
            ? null
            : await _dbContext.SavedFoods.FirstOrDefaultAsync(
                savedFood => savedFood.UserId == userId && savedFood.Barcode == normalizedBarcode,
                cancellationToken);

        if (existing is null)
        {
            existing = new SavedFood
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CreatedAtUtc = DateTime.UtcNow
            };

            _dbContext.SavedFoods.Add(existing);
        }

        existing.Kind = normalizedKind;
        existing.Name = request.Name.Trim();
        existing.MealName = request.MealName.Trim();
        existing.Barcode = normalizedBarcode;
        existing.Calories = request.Calories;
        existing.Protein = request.Protein;
        existing.Carbs = request.Carbs;
        existing.Fat = request.Fat;
        existing.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(existing));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var item = await _dbContext.SavedFoods
            .FirstOrDefaultAsync(savedFood => savedFood.Id == id && savedFood.UserId == userId, cancellationToken);

        if (item is null)
        {
            return NotFound();
        }

        _dbContext.SavedFoods.Remove(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SavedFoodDto>> Update(Guid id, UpsertSavedFoodRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var normalizedKind = request.Kind.Trim().ToLowerInvariant();

        if (!AllowedKinds.Contains(normalizedKind))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(request.Kind)] = ["Kind must be favorite, template, or packaged."]
            }));
        }

        var item = await _dbContext.SavedFoods
            .FirstOrDefaultAsync(savedFood => savedFood.Id == id && savedFood.UserId == userId, cancellationToken);

        if (item is null)
        {
            return NotFound();
        }

        var normalizedBarcode = NormalizeBarcode(request.Barcode);

        if (normalizedBarcode is not null)
        {
            var barcodeBelongsToAnotherFood = await _dbContext.SavedFoods
                .AsNoTracking()
                .AnyAsync(
                    savedFood => savedFood.UserId == userId
                        && savedFood.Id != id
                        && savedFood.Barcode == normalizedBarcode,
                    cancellationToken);

            if (barcodeBelongsToAnotherFood)
            {
                return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
                {
                    [nameof(request.Barcode)] = ["Barcode is already saved for another food."]
                }));
            }
        }

        item.Kind = normalizedKind;
        item.Name = request.Name.Trim();
        item.MealName = request.MealName.Trim();
        item.Barcode = normalizedBarcode;
        item.Calories = request.Calories;
        item.Protein = request.Protein;
        item.Carbs = request.Carbs;
        item.Fat = request.Fat;
        item.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(item));
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    private static string? NormalizeBarcode(string? barcode)
    {
        if (string.IsNullOrWhiteSpace(barcode))
        {
            return null;
        }

        var normalized = new string(barcode.Where(char.IsDigit).ToArray());
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static SavedFoodDto ToDto(SavedFood savedFood)
    {
        return new SavedFoodDto(
            savedFood.Id.ToString(),
            savedFood.Kind,
            savedFood.Name,
            savedFood.MealName,
            savedFood.Barcode,
            savedFood.Calories,
            savedFood.Protein,
            savedFood.Carbs,
            savedFood.Fat,
            true);
    }

    private static SavedFoodDto ToDto(BarcodeLookupFoodResult foodResult)
    {
        return new SavedFoodDto(
            "",
            "packaged",
            foodResult.Name,
            foodResult.MealName,
            foodResult.Barcode,
            foodResult.Calories,
            foodResult.Protein,
            foodResult.Carbs,
            foodResult.Fat,
            false);
    }
}