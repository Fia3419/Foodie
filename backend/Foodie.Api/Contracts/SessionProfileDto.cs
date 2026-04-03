namespace Foodie.Api.Contracts;

public sealed record GoalOptionDto(string Mode, string Label, string Description);

public sealed record SessionProfileDto(
    string UserName,
    string Email,
    string SelectedGoalMode,
    int QueuedActions,
    IReadOnlyList<GoalOptionDto> AvailableGoals);