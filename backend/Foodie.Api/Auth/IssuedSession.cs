namespace Foodie.Api.Auth;

public sealed record IssuedSession(TokenPair TokenPair, Guid SessionId, string DeviceName);