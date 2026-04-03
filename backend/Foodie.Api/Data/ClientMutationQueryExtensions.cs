using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Data;

public static class ClientMutationQueryExtensions
{
    public static Task<TEntry?> FindByClientMutationIdAsync<TEntry>(
        this IQueryable<TEntry> query,
        Guid userId,
        string? clientMutationId,
        CancellationToken cancellationToken)
        where TEntry : class
    {
        if (string.IsNullOrWhiteSpace(clientMutationId))
        {
            return Task.FromResult<TEntry?>(null);
        }

        return query
            .AsNoTracking()
            .FirstOrDefaultAsync(
                entry => EF.Property<Guid>(entry, "UserId") == userId
                    && EF.Property<string?>(entry, "ClientMutationId") == clientMutationId,
                cancellationToken);
    }
}