using System.Globalization;
using System.Text.RegularExpressions;

namespace Foodie.Api.Infrastructure;

/// <summary>
/// Lightweight English → Swedish dictionary for translating ingredient names and
/// short instruction snippets imported from English-language recipe APIs.
/// Word-boundary matched; unknown words are left as-is.
/// </summary>
public static partial class EnglishToSwedishDictionary
{
    private static readonly Dictionary<string, string> Words = new(StringComparer.OrdinalIgnoreCase)
    {
        // proteins
        ["chicken"] = "kyckling",
        ["chicken breast"] = "kycklingbröstfilé",
        ["chicken thigh"] = "kycklinglår",
        ["beef"] = "nötkött",
        ["ground beef"] = "nötfärs",
        ["minced beef"] = "nötfärs",
        ["pork"] = "fläskkött",
        ["bacon"] = "bacon",
        ["ham"] = "skinka",
        ["turkey"] = "kalkon",
        ["lamb"] = "lammkött",
        ["fish"] = "fisk",
        ["salmon"] = "lax",
        ["tuna"] = "tonfisk",
        ["cod"] = "torsk",
        ["shrimp"] = "räkor",
        ["prawns"] = "räkor",
        ["egg"] = "ägg",
        ["eggs"] = "ägg",
        ["tofu"] = "tofu",
        ["tempeh"] = "tempeh",
        ["chickpeas"] = "kikärter",
        ["lentils"] = "linser",
        ["beans"] = "bönor",
        ["black beans"] = "svarta bönor",
        ["kidney beans"] = "kidneybönor",
        // dairy
        ["milk"] = "mjölk",
        ["butter"] = "smör",
        ["cheese"] = "ost",
        ["parmesan"] = "parmesan",
        ["feta"] = "fetaost",
        ["mozzarella"] = "mozzarella",
        ["yogurt"] = "yoghurt",
        ["greek yogurt"] = "grekisk yoghurt",
        ["cream"] = "grädde",
        ["sour cream"] = "gräddfil",
        ["cottage cheese"] = "keso",
        ["quark"] = "kvarg",
        // grains and carbs
        ["rice"] = "ris",
        ["brown rice"] = "fullkornsris",
        ["pasta"] = "pasta",
        ["spaghetti"] = "spaghetti",
        ["noodles"] = "nudlar",
        ["bread"] = "bröd",
        ["oats"] = "havregryn",
        ["oatmeal"] = "havregrynsgröt",
        ["quinoa"] = "quinoa",
        ["flour"] = "mjöl",
        ["wheat flour"] = "vetemjöl",
        ["potato"] = "potatis",
        ["potatoes"] = "potatis",
        ["sweet potato"] = "sötpotatis",
        // vegetables
        ["onion"] = "lök",
        ["garlic"] = "vitlök",
        ["tomato"] = "tomat",
        ["tomatoes"] = "tomater",
        ["carrot"] = "morot",
        ["carrots"] = "morötter",
        ["broccoli"] = "broccoli",
        ["spinach"] = "spenat",
        ["kale"] = "grönkål",
        ["cabbage"] = "vitkål",
        ["lettuce"] = "sallad",
        ["cucumber"] = "gurka",
        ["pepper"] = "paprika",
        ["bell pepper"] = "paprika",
        ["mushroom"] = "champinjon",
        ["mushrooms"] = "champinjoner",
        ["zucchini"] = "zucchini",
        ["eggplant"] = "aubergine",
        ["corn"] = "majs",
        ["peas"] = "ärtor",
        ["avocado"] = "avokado",
        // fruits
        ["apple"] = "äpple",
        ["banana"] = "banan",
        ["lemon"] = "citron",
        ["lime"] = "lime",
        ["orange"] = "apelsin",
        ["berries"] = "bär",
        ["blueberries"] = "blåbär",
        ["strawberries"] = "jordgubbar",
        ["raspberries"] = "hallon",
        // fats and oils
        ["oil"] = "olja",
        ["olive oil"] = "olivolja",
        ["coconut oil"] = "kokosolja",
        ["rapeseed oil"] = "rapsolja",
        // pantry
        ["salt"] = "salt",
        ["pepper"] = "peppar",
        ["sugar"] = "socker",
        ["honey"] = "honung",
        ["soy sauce"] = "sojasås",
        ["vinegar"] = "vinäger",
        ["mustard"] = "senap",
        ["ketchup"] = "ketchup",
        ["spices"] = "kryddor",
        ["herbs"] = "örter",
        ["basil"] = "basilika",
        ["oregano"] = "oregano",
        ["thyme"] = "timjan",
        ["parsley"] = "persilja",
        ["dill"] = "dill",
        ["chili"] = "chili",
        ["curry"] = "curry",
        ["paprika"] = "paprikapulver",
        ["cinnamon"] = "kanel",
        ["ginger"] = "ingefära",
        // verbs/instructions
        ["bake"] = "baka",
        ["boil"] = "koka",
        ["fry"] = "stek",
        ["mix"] = "blanda",
        ["stir"] = "rör",
        ["add"] = "tillsätt",
        ["serve"] = "servera",
        ["chop"] = "hacka",
        ["slice"] = "skiva",
        ["heat"] = "värm",
        ["cook"] = "tillaga",
        ["preheat"] = "förvärm",
        ["minutes"] = "minuter",
        ["seconds"] = "sekunder",
        ["hour"] = "timme",
        ["hours"] = "timmar",
        ["with"] = "med",
        ["and"] = "och",
        ["the"] = "",
        ["a"] = "",
        ["of"] = "av",
        ["in"] = "i",
        ["on"] = "på",
        ["to"] = "till",
        ["for"] = "för",
    };

    private static readonly Regex WordPattern = new(@"[A-Za-z][A-Za-z\-]*", RegexOptions.Compiled);

    private static readonly PhraseTranslator Translator = new(Words, WordPattern);

    public static string Translate(string englishText)
    {
        if (string.IsNullOrWhiteSpace(englishText))
        {
            return englishText;
        }

        var working = Translator.Translate(englishText);

        if (working.Length == 0)
        {
            return englishText;
        }

        return char.ToUpper(working[0], CultureInfo.InvariantCulture) + working[1..];
    }
}
