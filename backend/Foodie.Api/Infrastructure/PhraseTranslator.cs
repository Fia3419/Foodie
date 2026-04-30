using System.Text.RegularExpressions;

namespace Foodie.Api.Infrastructure;

/// <summary>
/// Compiles a "longest-phrase first, then per-word" translation lookup once and applies it
/// to incoming text. Designed to be reused for English→Swedish ingredient/instruction and
/// unit translation.
/// </summary>
internal sealed class PhraseTranslator
{
    private readonly IReadOnlyDictionary<string, string> _words;
    private readonly (Regex Pattern, string Replacement)[] _phrasePatterns;
    private readonly Regex _wordPattern;
    private static readonly Regex MultipleSpacesPattern = new(@"\s{2,}", RegexOptions.Compiled);

    public PhraseTranslator(IReadOnlyDictionary<string, string> words, Regex wordPattern)
    {
        _words = words;
        _wordPattern = wordPattern;
        _phrasePatterns = words
            .Where(entry => entry.Key.Contains(' '))
            .OrderByDescending(entry => entry.Key.Length)
            .Select(entry => (
                new Regex($@"\b{Regex.Escape(entry.Key)}\b", RegexOptions.Compiled | RegexOptions.IgnoreCase),
                entry.Value))
            .ToArray();
    }

    public string Translate(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return text;
        }

        var working = text;

        foreach (var (pattern, replacement) in _phrasePatterns)
        {
            working = pattern.Replace(working, replacement);
        }

        working = _wordPattern.Replace(working, match =>
            _words.TryGetValue(match.Value, out var translated) ? translated : match.Value);

        return MultipleSpacesPattern.Replace(working, " ").Trim();
    }
}
