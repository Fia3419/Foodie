using Foodie.Api.Contracts;

namespace Foodie.Api.Infrastructure;

public sealed record ImportedRecipe(
    string Name,
    int Servings,
    int CaloriesPerServing,
    int ProteinPerServing,
    int CarbsPerServing,
    int FatPerServing,
    IReadOnlyList<string> Tags,
    IReadOnlyList<RecipeIngredientDto> Ingredients,
    string Instructions,
    string? SourceUrl);

public interface IRecipeImportService
{
    bool IsConfigured { get; }

    Task<IReadOnlyList<ImportedRecipe>> SearchAsync(
        string query,
        int maxResults,
        bool translateToSwedish,
        CancellationToken cancellationToken);
}
