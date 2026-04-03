using System.Globalization;

namespace Foodie.Api.Localization;

public sealed class ApiTextLocalizer : IApiTextLocalizer
{
    public string Get(ApiTextKey key)
    {
        var language = CultureInfo.CurrentUICulture.TwoLetterISOLanguageName;

        return language == "sv" ? GetSwedish(key) : GetEnglish(key);
    }

    private static string GetEnglish(ApiTextKey key) => key switch
    {
        ApiTextKey.ValidationFailedTitle => "Validation failed",
        ApiTextKey.ValidationFailedDetail => "One or more submitted values are invalid.",
        ApiTextKey.AccountExists => "An account with that email already exists.",
        ApiTextKey.InvalidCredentials => "Invalid email or password.",
        ApiTextKey.InvalidRefreshToken => "Refresh token is invalid or expired.",
        ApiTextKey.RecipeNotFound => "Recipe could not be found.",
        ApiTextKey.RecipeDeleted => "Recipe deleted.",
        ApiTextKey.OtherSessionsRevoked => "Other sessions revoked.",
        ApiTextKey.SessionNotFound => "Session could not be found.",
        ApiTextKey.SessionRevoked => "Session revoked.",
        ApiTextKey.SessionAlreadyRevoked => "Session has already been revoked.",
        _ => "Unknown error."
    };

    private static string GetSwedish(ApiTextKey key) => key switch
    {
        ApiTextKey.ValidationFailedTitle => "Valideringen misslyckades",
        ApiTextKey.ValidationFailedDetail => "Ett eller flera skickade värden är ogiltiga.",
        ApiTextKey.AccountExists => "Ett konto med den e-postadressen finns redan.",
        ApiTextKey.InvalidCredentials => "Ogiltig e-postadress eller lösenord.",
        ApiTextKey.InvalidRefreshToken => "Refresh token är ogiltig eller har gått ut.",
        ApiTextKey.RecipeNotFound => "Receptet kunde inte hittas.",
        ApiTextKey.RecipeDeleted => "Receptet har tagits bort.",
        ApiTextKey.OtherSessionsRevoked => "Övriga sessioner har återkallats.",
        ApiTextKey.SessionNotFound => "Sessionen kunde inte hittas.",
        ApiTextKey.SessionRevoked => "Sessionen har återkallats.",
        ApiTextKey.SessionAlreadyRevoked => "Sessionen är redan återkallad.",
        _ => "Okänt fel."
    };
}