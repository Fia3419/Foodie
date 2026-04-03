using Foodie.Api.Auth;
using Foodie.Api.Contracts;
using Foodie.Api.Data;
using Foodie.Api.Entities;
using Foodie.Api.Localization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly FoodieDbContext _dbContext;
    private readonly IApiTextLocalizer _localizer;
    private readonly IPasswordHasher<FoodieUser> _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthController(
        FoodieDbContext dbContext,
        IApiTextLocalizer localizer,
        IPasswordHasher<FoodieUser> passwordHasher,
        ITokenService tokenService)
    {
        _dbContext = dbContext;
        _localizer = localizer;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken))
        {
            return Conflict(new ApiMessageDto(_localizer.Get(ApiTextKey.AccountExists)));
        }

        var user = new FoodieUser
        {
            Id = Guid.NewGuid(),
            UserName = request.UserName.Trim(),
            Email = email,
            SelectedGoalMode = request.GoalMode,
            CreatedAtUtc = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        SeedStarterData(user.Id);
        var issuedSession = CreateAndTrackRefreshToken(user, null, GetDeviceName());
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToAuthResponse(user, issuedSession));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users.SingleOrDefaultAsync(entity => entity.Email == email, cancellationToken);

        if (user is null)
        {
            return Unauthorized(new ApiMessageDto(_localizer.Get(ApiTextKey.InvalidCredentials)));
        }

        var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new ApiMessageDto(_localizer.Get(ApiTextKey.InvalidCredentials)));
        }

        var issuedSession = CreateAndTrackRefreshToken(user, null, GetDeviceName());
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToAuthResponse(user, issuedSession));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshRequestDto request, CancellationToken cancellationToken)
    {
        var refreshToken = await _dbContext.RefreshTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(token => token.Token == request.RefreshToken, cancellationToken);

        if (refreshToken is null || refreshToken.RevokedAtUtc is not null || refreshToken.ExpiresAtUtc <= DateTime.UtcNow)
        {
            return Unauthorized(new ApiMessageDto(_localizer.Get(ApiTextKey.InvalidRefreshToken)));
        }

        refreshToken.RevokedAtUtc = DateTime.UtcNow;
        refreshToken.LastUsedAtUtc = DateTime.UtcNow;
        var issuedSession = CreateAndTrackRefreshToken(refreshToken.User, refreshToken.SessionId, refreshToken.DeviceName);
        refreshToken.ReplacedByToken = issuedSession.TokenPair.RefreshToken;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(ToAuthResponse(refreshToken.User, issuedSession));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var refreshTokens = await _dbContext.RefreshTokens
            .Where(token => token.UserId == userId && token.SessionId == request.SessionId && token.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.RevokedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }

    [Authorize]
    [HttpGet("sessions")]
    public async Task<ActionResult<IReadOnlyList<SessionSummaryDto>>> GetSessions(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var sessions = await _dbContext.RefreshTokens
            .Where(token => token.UserId == userId)
            .OrderByDescending(token => token.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var items = sessions
            .GroupBy(token => token.SessionId)
            .Select(group => group.OrderByDescending(token => token.CreatedAtUtc).First())
            .OrderByDescending(token => token.LastUsedAtUtc)
            .Select(token => new SessionSummaryDto(
                token.SessionId,
                token.DeviceName,
                token.CreatedAtUtc,
                token.LastUsedAtUtc,
                token.ExpiresAtUtc,
                token.RevokedAtUtc is not null))
            .ToList();

        return Ok(items);
    }

    [Authorize]
    [HttpPost("sessions/{sessionId:guid}/revoke")]
    public async Task<ActionResult<ApiMessageDto>> RevokeSession(Guid sessionId, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var refreshTokens = await _dbContext.RefreshTokens
            .Where(token => token.UserId == userId && token.SessionId == sessionId)
            .ToListAsync(cancellationToken);

        if (refreshTokens.Count == 0)
        {
            return NotFound(new ApiMessageDto(_localizer.Get(ApiTextKey.SessionNotFound)));
        }

        if (refreshTokens.All(token => token.RevokedAtUtc is not null))
        {
            return Ok(new ApiMessageDto(_localizer.Get(ApiTextKey.SessionAlreadyRevoked)));
        }

        foreach (var refreshToken in refreshTokens.Where(token => token.RevokedAtUtc is null))
        {
            refreshToken.RevokedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiMessageDto(_localizer.Get(ApiTextKey.SessionRevoked)));
    }

    [Authorize]
    [HttpPost("sessions/revoke-others")]
    public async Task<ActionResult<ApiMessageDto>> RevokeOtherSessions(CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var currentSessionId = Guid.Parse(User.FindFirst("session_id")?.Value ?? Guid.Empty.ToString());
        var refreshTokens = await _dbContext.RefreshTokens
            .Where(token => token.UserId == userId && token.SessionId != currentSessionId && token.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.RevokedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new ApiMessageDto(_localizer.Get(ApiTextKey.OtherSessionsRevoked)));
    }

    private AuthResponseDto ToAuthResponse(FoodieUser user, IssuedSession issuedSession)
    {
        return new AuthResponseDto(
            user.Id,
            user.UserName,
            user.Email,
            user.SelectedGoalMode,
            issuedSession.TokenPair.AccessToken,
            issuedSession.TokenPair.RefreshToken,
            issuedSession.TokenPair.AccessTokenExpiresAtUtc,
            issuedSession.TokenPair.RefreshTokenExpiresAtUtc,
            issuedSession.SessionId);
    }

    private IssuedSession CreateAndTrackRefreshToken(FoodieUser user, Guid? existingSessionId, string deviceName)
    {
        var sessionId = existingSessionId ?? Guid.NewGuid();
        var tokenPair = _tokenService.CreateTokenPair(user, sessionId);

        _dbContext.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            UserId = user.Id,
            Token = tokenPair.RefreshToken,
            DeviceName = deviceName,
            CreatedAtUtc = DateTime.UtcNow,
            LastUsedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = tokenPair.RefreshTokenExpiresAtUtc
        });

        return new IssuedSession(tokenPair, sessionId, deviceName);
    }

    private string GetDeviceName()
    {
        var explicitName = Request.Headers["X-Device-Name"].ToString().Trim();
        if (!string.IsNullOrWhiteSpace(explicitName))
        {
            return explicitName[..Math.Min(explicitName.Length, 120)];
        }

        var userAgent = Request.Headers.UserAgent.ToString();
        if (!string.IsNullOrWhiteSpace(userAgent))
        {
            return userAgent[..Math.Min(userAgent.Length, 120)];
        }

        return "Unknown device";
    }

    private void SeedStarterData(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        _dbContext.MealLogEntries.AddRange(
            new MealLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MealName = "Breakfast",
                FoodName = "Skyr bowl with berries and oats",
                Calories = 420,
                Protein = 32,
                Carbs = 43,
                Fat = 11,
                LogDate = today,
                LoggedAt = "07:30",
                CreatedAtUtc = DateTime.UtcNow
            },
            new MealLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                MealName = "Lunch",
                FoodName = "Chicken rice bowl",
                Calories = 610,
                Protein = 48,
                Carbs = 61,
                Fat = 17,
                LogDate = today,
                LoggedAt = "12:20",
                CreatedAtUtc = DateTime.UtcNow
            });

        _dbContext.WeightLogEntries.AddRange(
            new WeightLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EntryDate = today.AddDays(-6),
                WeightKg = 73.6m,
                CreatedAtUtc = DateTime.UtcNow
            },
            new WeightLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EntryDate = today.AddDays(-4),
                WeightKg = 73.8m,
                CreatedAtUtc = DateTime.UtcNow
            },
            new WeightLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EntryDate = today.AddDays(-2),
                WeightKg = 74.0m,
                CreatedAtUtc = DateTime.UtcNow
            },
            new WeightLogEntry
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EntryDate = today,
                WeightKg = 74.1m,
                CreatedAtUtc = DateTime.UtcNow
            });
    }
}