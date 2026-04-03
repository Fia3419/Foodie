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
[Route("api/progress")]
[Authorize]
public sealed class ProgressController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;

    public ProgressController(FoodieDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("weight")]
    public async Task<ActionResult<IReadOnlyList<WeightEntryDto>>> GetWeight(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        IReadOnlyList<WeightEntryDto> items = await _dbContext.WeightLogEntries
            .AsNoTracking()
            .Where(entry => entry.UserId == userId)
            .OrderBy(entry => entry.EntryDate)
            .Select(entry => new WeightEntryDto(entry.EntryDate.ToString("yyyy-MM-dd"), entry.WeightKg))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpPost("weight")]
    public async Task<ActionResult<WeightEntryDto>> CreateWeight(CreateWeightEntryRequestDto request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (!RequestDateResolver.TryParseIsoDate(request.Date, out var entryDate))
        {
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                [nameof(request.Date)] = ["Date must use yyyy-MM-dd format."]
            }));
        }

        var existing = await _dbContext.WeightLogEntries
            .FindByClientMutationIdAsync(userId, request.ClientMutationId, cancellationToken);

        if (existing is not null)
        {
            return Ok(new WeightEntryDto(existing.EntryDate.ToString("yyyy-MM-dd"), existing.WeightKg));
        }

        var entry = new WeightLogEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            EntryDate = entryDate,
            WeightKg = request.WeightKg,
            ClientMutationId = request.ClientMutationId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.WeightLogEntries.Add(entry);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException) when (!string.IsNullOrWhiteSpace(request.ClientMutationId))
        {
            existing = await _dbContext.WeightLogEntries
                .FindByClientMutationIdAsync(userId, request.ClientMutationId, cancellationToken);

            if (existing is not null)
            {
                return Ok(new WeightEntryDto(existing.EntryDate.ToString("yyyy-MM-dd"), existing.WeightKg));
            }

            throw;
        }

        return Ok(new WeightEntryDto(entry.EntryDate.ToString("yyyy-MM-dd"), entry.WeightKg));
    }
}