namespace Foodie.Api.Contracts;

public sealed record MacroSummaryDto(int Calories, int Protein, int Carbs, int Fat);

public sealed record DashboardSummaryDto(
    string UserName,
    string SelectedGoalMode,
    MacroSummaryDto DailyTarget,
    MacroSummaryDto ConsumedToday,
    int WeeklyAdherence,
    int StreakDays,
    string NextMilestone,
    string FocusMessage);