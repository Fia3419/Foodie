using System.Security.Claims;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Controllers;

[ApiController]
[Route("api/session")]
[Authorize]
public sealed class SessionController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;

    public SessionController(FoodieDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<SessionProfileDto>> Get(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var user = await _dbContext.Users.SingleAsync(entity => entity.Id == userId, cancellationToken);

        return Ok(new SessionProfileDto(
            user.UserName,
            user.Email,
            user.SelectedGoalMode,
            0,
            [
                new GoalOptionDto("general-health", "General health", "Balanced nutrition, steady routines, and maintainable habits."),
                new GoalOptionDto("gain-strength", "Gain strength", "Support training with higher protein, enough carbs, and reliable recovery."),
                new GoalOptionDto("lose-weight", "Lose weight", "Stay in a controlled deficit without sacrificing protein and satiety.")
            ]));
    }

    [HttpPost("goal")]
    public async Task<IActionResult> UpdateGoalMode(UpdateGoalModeRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var user = await _dbContext.Users.SingleAsync(entity => entity.Id == userId, cancellationToken);
        user.SelectedGoalMode = request.GoalMode;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}