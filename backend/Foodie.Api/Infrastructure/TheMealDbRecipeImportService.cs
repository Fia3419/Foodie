using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Foodie.Api.Contracts;

namespace Foodie.Api.Infrastructure;

/// <summary>
/// Imports recipes from TheMealDB free public API.
/// Reference: https://www.themealdb.com/api.php (test key "1" allowed for low-volume use).
/// </summary>
public sealed class TheMealDbRecipeImportService : IRecipeImportService
{
    private const int IngredientSlots = 20;

    private readonly HttpClient _httpClient;

    public TheMealDbRecipeImportService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public bool IsConfigured => true;

    public async Task<IReadOnlyList<ImportedRecipe>> SearchAsync(
        string query,
        int maxResults,
        bool translateToSwedish,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var clampedMax = Math.Clamp(maxResults, 1, 20);
        var url = $"api/json/v1/1/search.php?s={Uri.EscapeDataString(query)}";

        using var response = await _httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return [];
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var payload = await JsonSerializer.DeserializeAsync<TheMealDbResponse>(stream, cancellationToken: cancellationToken);
        var meals = payload?.Meals ?? [];

        return meals
            .Take(clampedMax)
            .Select(meal => MapMeal(meal, translateToSwedish))
            .ToList();
    }

    private static ImportedRecipe MapMeal(TheMealDbMeal meal, bool translate)
    {
        var name = meal.StrMeal ?? "Untitled";
        var instructions = meal.StrInstructions ?? string.Empty;
        var ingredients = ExtractIngredients(meal, translate);

        var tags = new List<string> { "TheMealDB" };

        if (!string.IsNullOrWhiteSpace(meal.StrCategory))
        {
            tags.Add(translate ? EnglishToSwedishDictionary.Translate(meal.StrCategory) : meal.StrCategory);
        }

        if (!string.IsNullOrWhiteSpace(meal.StrArea))
        {
            tags.Add(meal.StrArea);
        }

        if (!string.IsNullOrWhiteSpace(meal.StrTags))
        {
            foreach (var tag in meal.StrTags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                tags.Add(translate ? EnglishToSwedishDictionary.Translate(tag) : tag);
            }
        }

        if (translate)
        {
            name = EnglishToSwedishDictionary.Translate(name);
            instructions = EnglishToSwedishDictionary.Translate(instructions);
        }

        return new ImportedRecipe(
            name,
            Servings: 4,
            CaloriesPerServing: 0,
            ProteinPerServing: 0,
            CarbsPerServing: 0,
            FatPerServing: 0,
            tags,
            ingredients,
            instructions,
            meal.StrSource);
    }

    private static IReadOnlyList<RecipeIngredientDto> ExtractIngredients(TheMealDbMeal meal, bool translate)
    {
        var list = new List<RecipeIngredientDto>(IngredientSlots);
        var raw = meal.AsRawIngredients();

        for (var i = 0; i < IngredientSlots; i++)
        {
            var name = raw[i].name?.Trim();
            var measure = raw[i].measure?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            var (amount, unit) = NormalizeMeasure(ParseMeasure(measure));

            if (translate)
            {
                name = EnglishToSwedishDictionary.Translate(name);
            }

            list.Add(new RecipeIngredientDto(
                Truncate(name!, 120),
                amount,
                Truncate(unit, 16),
                0,
                0,
                0,
                0));
        }

        return list;
    }

    private static (decimal amount, string unit) ParseMeasure(string measure)
    {
        if (string.IsNullOrWhiteSpace(measure))
        {
            return (0m, string.Empty);
        }

        var trimmed = measure.Trim();
        var splitIndex = -1;

        for (var i = 0; i < trimmed.Length; i++)
        {
            var ch = trimmed[i];
            if (!char.IsDigit(ch) && ch != '.' && ch != ',' && ch != '/' && ch != ' ')
            {
                splitIndex = i;
                break;
            }
        }

        if (splitIndex < 0)
        {
            return TryParseAmount(trimmed, out var onlyAmount) ? (onlyAmount, string.Empty) : (0m, trimmed);
        }

        var amountPart = trimmed[..splitIndex].Trim();
        var unitPart = trimmed[splitIndex..].Trim();

        if (string.IsNullOrEmpty(amountPart))
        {
            return (0m, unitPart);
        }

        return TryParseAmount(amountPart, out var amount) ? (amount, unitPart) : (0m, trimmed);
    }

    private static bool TryParseAmount(string value, out decimal amount)
    {
        amount = 0m;
        var normalized = value.Replace(',', '.').Trim();

        if (normalized.Contains('/'))
        {
            // Handle "1 1/2" or "1/2" style fractions.
            var parts = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            decimal total = 0m;
            foreach (var part in parts)
            {
                if (part.Contains('/'))
                {
                    var fraction = part.Split('/');
                    if (fraction.Length == 2
                        && decimal.TryParse(fraction[0], NumberStyles.Number, CultureInfo.InvariantCulture, out var num)
                        && decimal.TryParse(fraction[1], NumberStyles.Number, CultureInfo.InvariantCulture, out var den)
                        && den != 0m)
                    {
                        total += num / den;
                    }
                    else
                    {
                        return false;
                    }
                }
                else if (decimal.TryParse(part, NumberStyles.Number, CultureInfo.InvariantCulture, out var whole))
                {
                    total += whole;
                }
                else
                {
                    return false;
                }
            }

            amount = decimal.Round(total, 2);
            return true;
        }

        if (decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out var parsed))
        {
            amount = decimal.Round(parsed, 2);
            return true;
        }

        return false;
    }

    private static string Truncate(string value, int maxLength)
        => value.Length <= maxLength ? value : value[..maxLength];

    private static (decimal amount, string unit) NormalizeMeasure((decimal amount, string unit) measure)
    {
        var unit = measure.unit.Trim();

        if (measure.amount > 0m && UnitConversions.TryGetValue(unit, out var conversion))
        {
            return (decimal.Round(measure.amount * conversion.Factor, 2), conversion.Unit);
        }

        return (measure.amount, TranslateUnitToSwedish(unit));
    }

    private sealed record UnitConversion(decimal Factor, string Unit);

    private static readonly Dictionary<string, UnitConversion> UnitConversions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["cup"] = new(2.4m, "dl"),
        ["cups"] = new(2.4m, "dl"),
        ["pint"] = new(4.73m, "dl"),
        ["pints"] = new(4.73m, "dl"),
        ["quart"] = new(9.46m, "dl"),
        ["quarts"] = new(9.46m, "dl"),
        ["gallon"] = new(37.85m, "dl"),
        ["gallons"] = new(37.85m, "dl"),
        ["fl oz"] = new(29.57m, "ml"),
        ["fluid ounce"] = new(29.57m, "ml"),
        ["fluid ounces"] = new(29.57m, "ml"),
        ["oz"] = new(28.35m, "g"),
        ["oz."] = new(28.35m, "g"),
        ["ounce"] = new(28.35m, "g"),
        ["ounces"] = new(28.35m, "g"),
        ["lb"] = new(0.45m, "kg"),
        ["lbs"] = new(0.45m, "kg"),
        ["lb."] = new(0.45m, "kg"),
        ["pound"] = new(0.45m, "kg"),
        ["pounds"] = new(0.45m, "kg"),
    };

    private static readonly Dictionary<string, string> UnitTranslations = new(StringComparer.OrdinalIgnoreCase)
    {
        // volume
        ["tsp"] = "tsk",
        ["tsp."] = "tsk",
        ["teaspoon"] = "tsk",
        ["teaspoons"] = "tsk",
        ["tbsp"] = "msk",
        ["tbsp."] = "msk",
        ["tbs"] = "msk",
        ["tbs."] = "msk",
        ["tablespoon"] = "msk",
        ["tablespoons"] = "msk",
        ["cup"] = "dl",
        ["cups"] = "dl",
        ["pint"] = "pint",
        ["pints"] = "pint",
        ["quart"] = "quart",
        ["quarts"] = "quart",
        ["gallon"] = "gallon",
        ["gallons"] = "gallon",
        ["liter"] = "liter",
        ["liters"] = "liter",
        ["litre"] = "liter",
        ["litres"] = "liter",
        ["ml"] = "ml",
        ["cl"] = "cl",
        ["dl"] = "dl",
        ["l"] = "l",

        // weight
        ["oz"] = "g",
        ["oz."] = "g",
        ["ounce"] = "g",
        ["ounces"] = "g",
        ["lb"] = "kg",
        ["lbs"] = "kg",
        ["lb."] = "kg",
        ["pound"] = "kg",
        ["pounds"] = "kg",
        ["g"] = "g",
        ["gr"] = "g",
        ["gram"] = "g",
        ["grams"] = "g",
        ["kg"] = "kg",
        ["kilogram"] = "kg",
        ["kilograms"] = "kg",

        // approx amounts
        ["pinch"] = "nypa",
        ["pinches"] = "nypor",
        ["dash"] = "skvätt",
        ["dashes"] = "skvättar",
        ["drop"] = "droppe",
        ["drops"] = "droppar",
        ["splash"] = "skvätt",
        ["splashes"] = "skvättar",
        ["handful"] = "näve",
        ["handfuls"] = "nävar",
        ["dollop"] = "klick",
        ["dollops"] = "klickar",
        ["knob"] = "klick",
        ["knobs"] = "klickar",

        // pieces / containers
        ["clove"] = "klyfta",
        ["cloves"] = "klyftor",
        ["slice"] = "skiva",
        ["slices"] = "skivor",
        ["sprig"] = "kvist",
        ["sprigs"] = "kvistar",
        ["stick"] = "stjälk",
        ["sticks"] = "stjälkar",
        ["stalk"] = "stjälk",
        ["stalks"] = "stjälkar",
        ["bunch"] = "knippe",
        ["bunches"] = "knippen",
        ["head"] = "huvud",
        ["heads"] = "huvuden",
        ["can"] = "burk",
        ["cans"] = "burkar",
        ["tin"] = "burk",
        ["tins"] = "burkar",
        ["jar"] = "burk",
        ["jars"] = "burkar",
        ["bottle"] = "flaska",
        ["bottles"] = "flaskor",
        ["package"] = "förpackning",
        ["packages"] = "förpackningar",
        ["pack"] = "förpackning",
        ["packs"] = "förpackningar",
        ["packet"] = "påse",
        ["packets"] = "påsar",
        ["bag"] = "påse",
        ["bags"] = "påsar",
        ["box"] = "låda",
        ["boxes"] = "lådor",
        ["piece"] = "bit",
        ["pieces"] = "bitar",
        ["slab"] = "bit",
        ["slabs"] = "bitar",
        ["sheet"] = "ark",
        ["sheets"] = "ark",
        ["strip"] = "strimla",
        ["strips"] = "strimlor",
        ["loaf"] = "limpa",
        ["loaves"] = "limpor",

        // descriptors that often appear in the measure field
        ["large"] = "stor",
        ["medium"] = "mellan",
        ["small"] = "liten",
        ["whole"] = "hel",
        ["chopped"] = "hackad",
        ["sliced"] = "skivad",
        ["diced"] = "tärnad",
        ["grated"] = "riven",
        ["minced"] = "finhackad",
        ["crushed"] = "krossad",
        ["shredded"] = "strimlad",
        ["peeled"] = "skalad",
        ["melted"] = "smält",
        ["softened"] = "mjukt",
        ["chilled"] = "kylt",
        ["warm"] = "varmt",
        ["cold"] = "kallt",
        ["hot"] = "hett",
        ["finely"] = "fint",
        ["coarsely"] = "grovt",
        ["roughly"] = "grovt",
        ["thinly"] = "tunt",
        ["thickly"] = "tjockt",
        ["freshly"] = "färsk",
        ["fresh"] = "färsk",
        ["dried"] = "torkad",
        ["ripe"] = "mogen",
        ["raw"] = "rå",
        ["cooked"] = "tillagad",
    };

    private static readonly Dictionary<string, string> UnitPhraseTranslations = new(StringComparer.OrdinalIgnoreCase)
    {
        ["to taste"] = "efter smak",
        ["to garnish"] = "till garnering",
        ["for garnish"] = "till garnering",
        ["for serving"] = "till servering",
        ["for frying"] = "till stekning",
        ["for greasing"] = "till smörjning",
        ["for dusting"] = "till pudring",
        ["as needed"] = "efter behov",
        ["as required"] = "efter behov",
        ["finely chopped"] = "finhackad",
        ["finely sliced"] = "tunt skivad",
        ["finely diced"] = "finhackad",
        ["finely grated"] = "finriven",
        ["freshly ground"] = "nymalen",
        ["freshly chopped"] = "nyhackad",
        ["freshly grated"] = "nyriven",
        ["freshly squeezed"] = "nypressad",
        ["at room temperature"] = "rumstempererad",
    };

    private static readonly System.Text.RegularExpressions.Regex UnitWordPattern
        = new(@"[A-Za-z][A-Za-z\.]*", System.Text.RegularExpressions.RegexOptions.Compiled);

    private static readonly PhraseTranslator UnitPhraseTranslator
        = new(UnitPhraseTranslations, UnitWordPattern);

    private static string TranslateUnitToSwedish(string unit)
    {
        if (string.IsNullOrWhiteSpace(unit))
        {
            return unit;
        }

        var working = unit.Trim();

        if (UnitTranslations.TryGetValue(working, out var directUnit))
        {
            return directUnit;
        }

        if (UnitPhraseTranslations.TryGetValue(working, out var directPhrase))
        {
            return directPhrase;
        }

        // Replace multi-word phrases first (longest first), then individual words.
        working = UnitPhraseTranslator.Translate(working);

        // PhraseTranslator only knows the phrase dictionary; run a second pass for single units.
        working = UnitWordPattern.Replace(working, match =>
            UnitTranslations.TryGetValue(match.Value, out var swedish) ? swedish : match.Value);

        return working;
    }

    private sealed class TheMealDbResponse
    {
        [JsonPropertyName("meals")]
        public List<TheMealDbMeal>? Meals { get; init; }
    }

    private sealed class TheMealDbMeal
    {
        [JsonPropertyName("strMeal")] public string? StrMeal { get; init; }
        [JsonPropertyName("strCategory")] public string? StrCategory { get; init; }
        [JsonPropertyName("strArea")] public string? StrArea { get; init; }
        [JsonPropertyName("strInstructions")] public string? StrInstructions { get; init; }
        [JsonPropertyName("strTags")] public string? StrTags { get; init; }
        [JsonPropertyName("strSource")] public string? StrSource { get; init; }

        [JsonPropertyName("strIngredient1")] public string? StrIngredient1 { get; init; }
        [JsonPropertyName("strIngredient2")] public string? StrIngredient2 { get; init; }
        [JsonPropertyName("strIngredient3")] public string? StrIngredient3 { get; init; }
        [JsonPropertyName("strIngredient4")] public string? StrIngredient4 { get; init; }
        [JsonPropertyName("strIngredient5")] public string? StrIngredient5 { get; init; }
        [JsonPropertyName("strIngredient6")] public string? StrIngredient6 { get; init; }
        [JsonPropertyName("strIngredient7")] public string? StrIngredient7 { get; init; }
        [JsonPropertyName("strIngredient8")] public string? StrIngredient8 { get; init; }
        [JsonPropertyName("strIngredient9")] public string? StrIngredient9 { get; init; }
        [JsonPropertyName("strIngredient10")] public string? StrIngredient10 { get; init; }
        [JsonPropertyName("strIngredient11")] public string? StrIngredient11 { get; init; }
        [JsonPropertyName("strIngredient12")] public string? StrIngredient12 { get; init; }
        [JsonPropertyName("strIngredient13")] public string? StrIngredient13 { get; init; }
        [JsonPropertyName("strIngredient14")] public string? StrIngredient14 { get; init; }
        [JsonPropertyName("strIngredient15")] public string? StrIngredient15 { get; init; }
        [JsonPropertyName("strIngredient16")] public string? StrIngredient16 { get; init; }
        [JsonPropertyName("strIngredient17")] public string? StrIngredient17 { get; init; }
        [JsonPropertyName("strIngredient18")] public string? StrIngredient18 { get; init; }
        [JsonPropertyName("strIngredient19")] public string? StrIngredient19 { get; init; }
        [JsonPropertyName("strIngredient20")] public string? StrIngredient20 { get; init; }

        [JsonPropertyName("strMeasure1")] public string? StrMeasure1 { get; init; }
        [JsonPropertyName("strMeasure2")] public string? StrMeasure2 { get; init; }
        [JsonPropertyName("strMeasure3")] public string? StrMeasure3 { get; init; }
        [JsonPropertyName("strMeasure4")] public string? StrMeasure4 { get; init; }
        [JsonPropertyName("strMeasure5")] public string? StrMeasure5 { get; init; }
        [JsonPropertyName("strMeasure6")] public string? StrMeasure6 { get; init; }
        [JsonPropertyName("strMeasure7")] public string? StrMeasure7 { get; init; }
        [JsonPropertyName("strMeasure8")] public string? StrMeasure8 { get; init; }
        [JsonPropertyName("strMeasure9")] public string? StrMeasure9 { get; init; }
        [JsonPropertyName("strMeasure10")] public string? StrMeasure10 { get; init; }
        [JsonPropertyName("strMeasure11")] public string? StrMeasure11 { get; init; }
        [JsonPropertyName("strMeasure12")] public string? StrMeasure12 { get; init; }
        [JsonPropertyName("strMeasure13")] public string? StrMeasure13 { get; init; }
        [JsonPropertyName("strMeasure14")] public string? StrMeasure14 { get; init; }
        [JsonPropertyName("strMeasure15")] public string? StrMeasure15 { get; init; }
        [JsonPropertyName("strMeasure16")] public string? StrMeasure16 { get; init; }
        [JsonPropertyName("strMeasure17")] public string? StrMeasure17 { get; init; }
        [JsonPropertyName("strMeasure18")] public string? StrMeasure18 { get; init; }
        [JsonPropertyName("strMeasure19")] public string? StrMeasure19 { get; init; }
        [JsonPropertyName("strMeasure20")] public string? StrMeasure20 { get; init; }

        public (string? name, string? measure)[] AsRawIngredients() =>
        [
            (StrIngredient1, StrMeasure1),
            (StrIngredient2, StrMeasure2),
            (StrIngredient3, StrMeasure3),
            (StrIngredient4, StrMeasure4),
            (StrIngredient5, StrMeasure5),
            (StrIngredient6, StrMeasure6),
            (StrIngredient7, StrMeasure7),
            (StrIngredient8, StrMeasure8),
            (StrIngredient9, StrMeasure9),
            (StrIngredient10, StrMeasure10),
            (StrIngredient11, StrMeasure11),
            (StrIngredient12, StrMeasure12),
            (StrIngredient13, StrMeasure13),
            (StrIngredient14, StrMeasure14),
            (StrIngredient15, StrMeasure15),
            (StrIngredient16, StrMeasure16),
            (StrIngredient17, StrMeasure17),
            (StrIngredient18, StrMeasure18),
            (StrIngredient19, StrMeasure19),
            (StrIngredient20, StrMeasure20),
        ];
    }
}
