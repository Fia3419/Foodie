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
[Route("api/food-log")]
[Authorize]
public sealed class FoodLogController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;

    public FoodLogController(FoodieDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("today")]
    public async Task<ActionResult<DailyLogDto>> GetToday([FromQuery] string? date, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var parsedDate = default(DateOnly);

        if (!string.IsNullOrWhiteSpace(date) && !RequestDateResolver.TryParseIsoDate(date, out parsedDate))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(date)] = ["Date must use yyyy-MM-dd format."]
            }));
        }

        var targetDate = string.IsNullOrWhiteSpace(date)
            ? RequestDateResolver.GetCurrentLocalDate(Request)
            : parsedDate;

        var items = await _dbContext.MealLogEntries
            .AsNoTracking()
            .Where(entry => entry.UserId == userId && entry.LogDate == targetDate)
            .OrderBy(entry => entry.LoggedAt)
            .Select(entry => new MealLogItemDto(
                entry.Id.ToString(),
                entry.MealName,
                entry.FoodName,
                entry.Calories,
                entry.Protein,
                entry.Carbs,
                entry.Fat,
                entry.LoggedAt))
            .ToListAsync(cancellationToken);

        return Ok(new DailyLogDto(targetDate.ToString("yyyy-MM-dd"), items));
    }

    [HttpPost]
    public async Task<ActionResult<MealLogItemDto>> Create(CreateMealLogEntryRequestDto request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!RequestDateResolver.TryParseIsoDate(request.LogDate, out var logDate))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(request.LogDate)] = ["Log date must use yyyy-MM-dd format."]
            }));
        }

        var existing = await _dbContext.MealLogEntries
            .FindByClientMutationIdAsync(userId, request.ClientMutationId, cancellationToken);

        if (existing is not null)
        {
            return Ok(ToDto(existing));
        }

        var entry = new MealLogEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            MealName = request.MealName,
            FoodName = request.FoodName,
            Calories = request.Calories,
            Protein = request.Protein,
            Carbs = request.Carbs,
            Fat = request.Fat,
            LogDate = logDate,
            LoggedAt = request.LoggedAt,
            ClientMutationId = request.ClientMutationId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.MealLogEntries.Add(entry);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException) when (!string.IsNullOrWhiteSpace(request.ClientMutationId))
        {
            existing = await _dbContext.MealLogEntries
                .FindByClientMutationIdAsync(userId, request.ClientMutationId, cancellationToken);

            if (existing is not null)
            {
                return Ok(ToDto(existing));
            }

            throw;
        }

        return Ok(ToDto(entry));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MealLogItemDto>> Update(Guid id, UpdateMealLogEntryRequestDto request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!RequestDateResolver.TryParseIsoDate(request.LogDate, out var logDate))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(request.LogDate)] = ["Log date must use yyyy-MM-dd format."]
            }));
        }

        var entry = await _dbContext.MealLogEntries
            .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);

        if (entry is null)
        {
            return NotFound();
        }

        entry.MealName = request.MealName;
        entry.FoodName = request.FoodName;
        entry.Calories = request.Calories;
        entry.Protein = request.Protein;
        entry.Carbs = request.Carbs;
        entry.Fat = request.Fat;
        entry.LogDate = logDate;
        entry.LoggedAt = request.LoggedAt;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToDto(entry));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var entry = await _dbContext.MealLogEntries
            .FirstOrDefaultAsync(item => item.Id == id && item.UserId == userId, cancellationToken);

        if (entry is null)
        {
            return NotFound();
        }

        _dbContext.MealLogEntries.Remove(entry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static MealLogItemDto ToDto(MealLogEntry entry)
    {
        return new MealLogItemDto(
            entry.Id.ToString(),
            entry.MealName,
            entry.FoodName,
            entry.Calories,
            entry.Protein,
            entry.Carbs,
            entry.Fat,
            entry.LoggedAt);
    }
}