using System.ComponentModel.DataAnnotations;

namespace Foodie.Api.Contracts;

public sealed record RegisterRequestDto(
    [Required, StringLength(100, MinimumLength = 2)] string UserName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password,
    [Required] string GoalMode);

public sealed record LoginRequestDto(
    [Required, EmailAddress] string Email,
    [Required] string Password);

public sealed record RefreshRequestDto([Required] string RefreshToken);

public sealed record LogoutRequestDto(Guid SessionId);

public sealed record SessionSummaryDto(
    Guid SessionId,
    string DeviceName,
    DateTime CreatedAtUtc,
    DateTime LastUsedAtUtc,
    DateTime ExpiresAtUtc,
    bool IsRevoked);

public sealed record AuthResponseDto(
    Guid UserId,
    string UserName,
    string Email,
    string SelectedGoalMode,
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAtUtc,
    DateTime RefreshTokenExpiresAtUtc,
    Guid SessionId);