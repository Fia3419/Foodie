namespace Foodie.Api.Entities;

public sealed class WeightLogEntry
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public DateOnly EntryDate { get; set; }

    public decimal WeightKg { get; set; }

    public string? ClientMutationId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public FoodieUser User { get; set; } = null!;
}