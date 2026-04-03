namespace Foodie.Api.Auth;

public sealed record TokenPair(string AccessToken, DateTime AccessTokenExpiresAtUtc, string RefreshToken, DateTime RefreshTokenExpiresAtUtc);