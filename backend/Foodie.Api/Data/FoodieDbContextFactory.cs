using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Foodie.Api.Data;

public sealed class FoodieDbContextFactory : IDesignTimeDbContextFactory<FoodieDbContext>
{
    public FoodieDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environmentName}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<FoodieDbContext>();
        ConfigureProvider(optionsBuilder, configuration);
        return new FoodieDbContext(optionsBuilder.Options);
    }

    public static void ConfigureProvider(DbContextOptionsBuilder optionsBuilder, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultDatabase")
            ?? throw new InvalidOperationException("Connection string 'DefaultDatabase' is not configured.");

        optionsBuilder.UseSqlServer(connectionString);
    }
}