using Foodie.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Foodie.Api.Data;

public sealed class FoodieDbContext : DbContext
{
    public FoodieDbContext(DbContextOptions<FoodieDbContext> options)
        : base(options)
    {
    }

    public DbSet<FoodieUser> Users => Set<FoodieUser>();

    public DbSet<MealLogEntry> MealLogEntries => Set<MealLogEntry>();

    public DbSet<WeightLogEntry> WeightLogEntries => Set<WeightLogEntry>();

    public DbSet<Recipe> Recipes => Set<Recipe>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FoodieUser>(entity =>
        {
            entity.Property(user => user.UserName).HasMaxLength(100);
            entity.Property(user => user.Email).HasMaxLength(320);
            entity.Property(user => user.PasswordHash).HasMaxLength(512);
            entity.Property(user => user.SelectedGoalMode).HasMaxLength(40);

            entity.HasIndex(user => user.Email)
                .IsUnique();
        });

        modelBuilder.Entity<MealLogEntry>(entity =>
        {
            entity.Property(entry => entry.MealName).HasMaxLength(50);
            entity.Property(entry => entry.FoodName).HasMaxLength(200);
            entity.Property(entry => entry.LoggedAt).HasMaxLength(5);
            entity.Property(entry => entry.ClientMutationId).HasMaxLength(64);

            entity.HasOne(entry => entry.User)
                .WithMany(user => user.MealLogEntries)
                .HasForeignKey(entry => entry.UserId);

            entity.HasIndex(entry => new { entry.UserId, entry.LogDate });

            entity.HasIndex(entry => new { entry.UserId, entry.ClientMutationId })
                .IsUnique()
                .HasFilter("[ClientMutationId] IS NOT NULL");
        });

        modelBuilder.Entity<WeightLogEntry>(entity =>
        {
            entity.Property(entry => entry.ClientMutationId).HasMaxLength(64);
            entity.Property(entry => entry.WeightKg).HasPrecision(6, 2);

            entity.HasOne(entry => entry.User)
                .WithMany(user => user.WeightLogEntries)
                .HasForeignKey(entry => entry.UserId);

            entity.HasIndex(entry => new { entry.UserId, entry.EntryDate });

            entity.HasIndex(entry => new { entry.UserId, entry.ClientMutationId })
                .IsUnique()
                .HasFilter("[ClientMutationId] IS NOT NULL");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.Property(recipe => recipe.Name).HasMaxLength(120);

            entity.HasOne(recipe => recipe.User)
                .WithMany(user => user.Recipes)
                .HasForeignKey(recipe => recipe.UserId)
                .IsRequired(false);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.Property(token => token.Token).HasMaxLength(450);
            entity.Property(token => token.ReplacedByToken).HasMaxLength(450);
            entity.Property(token => token.DeviceName).HasMaxLength(120);

            entity.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId);

            entity.HasIndex(token => token.Token)
                .IsUnique();

            entity.HasIndex(token => token.SessionId);
        });
    }
}