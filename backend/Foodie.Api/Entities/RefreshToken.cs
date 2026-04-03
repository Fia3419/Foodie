namespace Foodie.Api.Entities;

public sealed class RefreshToken
{
    public Guid Id { get; set; }

    public Guid SessionId { get; set; }

    public Guid UserId { get; set; }

    public string Token { get; set; } = string.Empty;

    public string DeviceName { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime LastUsedAtUtc { get; set; }

    public DateTime? RevokedAtUtc { get; set; }

    public string? ReplacedByToken { get; set; }

    public FoodieUser User { get; set; } = null!;
}