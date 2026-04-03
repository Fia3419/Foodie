using System.Security.Claims;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Foodie.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public sealed class DashboardController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;

    public DashboardController(FoodieDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardSummaryDto>> Get(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _dbContext.Users
            .AsNoTracking()
            .Where(entity => entity.Id == userId)
            .Select(entity => new
            {
                entity.UserName,
                entity.SelectedGoalMode,
            })
            .SingleAsync(cancellationToken);

        var today = RequestDateResolver.GetCurrentLocalDate(Request);
        var pastWeekStart = today.AddDays(-6);

        var entries = await _dbContext.MealLogEntries
            .AsNoTracking()
            .Where(entry => entry.UserId == userId && entry.LogDate >= pastWeekStart && entry.LogDate <= today)
            .GroupBy(entry => entry.LogDate)
            .Select(group => new
            {
                Date = group.Key,
                Calories = group.Sum(entry => entry.Calories),
                Protein = group.Sum(entry => entry.Protein),
                Carbs = group.Sum(entry => entry.Carbs),
                Fat = group.Sum(entry => entry.Fat),
            })
            .ToListAsync(cancellationToken);

        var entriesByDate = entries.ToDictionary(entry => entry.Date);
        var consumedToday = entriesByDate.TryGetValue(today, out var todayEntries)
            ? new MacroSummaryDto(todayEntries.Calories, todayEntries.Protein, todayEntries.Carbs, todayEntries.Fat)
            : new MacroSummaryDto(0, 0, 0, 0);

        var dailyTarget = user.SelectedGoalMode switch
        {
            "general-health" => new MacroSummaryDto(2200, 145, 230, 72),
            "lose-weight" => new MacroSummaryDto(1850, 165, 150, 60),
            _ => new MacroSummaryDto(2480, 182, 248, 76)
        };

        var pastWeek = Enumerable.Range(0, 7)
            .Select(offset => today.AddDays(-offset))
            .ToList();
        var perDayCalories = pastWeek
            .Select(date => entriesByDate.TryGetValue(date, out var summary) ? summary.Calories : 0)
            .ToList();
        var weeklyAdherence = perDayCalories.Count == 0
            ? 0
            : (int)Math.Round(perDayCalories.Average(total => Math.Clamp(100d - (Math.Abs(dailyTarget.Calories - total) / Math.Max(1, dailyTarget.Calories) * 100d), 0d, 100d)));

        var streakDays = 0;
        foreach (var date in pastWeek)
        {
            if (entriesByDate.ContainsKey(date))
            {
                streakDays++;
                continue;
            }

            break;
        }

        var nextMilestone = user.SelectedGoalMode switch
        {
            "general-health" => "Keep four balanced days in a row to stabilize your weekly average.",
            "lose-weight" => "Hold your deficit for three more days before adjusting calories.",
            _ => "2 more training days to hit your weekly strength target."
        };

        var focusMessage = user.SelectedGoalMode switch
        {
            "general-health" => "Keep meal timing regular and push fiber intake earlier in the day.",
            "lose-weight" => "Protein is solid. Keep dinner calories tighter to protect your weekly deficit.",
            _ => "Protein is on track. Add one carb-focused pre-workout meal before 17:00."
        };

        return Ok(new DashboardSummaryDto(
            user.UserName,
            user.SelectedGoalMode,
            dailyTarget,
            consumedToday,
            weeklyAdherence,
            streakDays,
            nextMilestone,
            focusMessage));
    }
}