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
        ApiTextKey.PasswordTooShort => "Password must be at least 12 characters long.",
        ApiTextKey.PasswordRequiresUppercase => "Password must contain at least one uppercase letter.",
        ApiTextKey.PasswordRequiresLowercase => "Password must contain at least one lowercase letter.",
        ApiTextKey.PasswordRequiresDigit => "Password must contain at least one number.",
        ApiTextKey.PasswordRequiresSpecialCharacter => "Password must contain at least one special character.",
        ApiTextKey.PasswordMustBeDifferent => "New password must be different from the current password.",
        ApiTextKey.InvalidRefreshToken => "Refresh token is invalid or expired.",
        ApiTextKey.PasswordResetRequested => "If the account exists, a reset code has been issued.",
        ApiTextKey.InvalidPasswordResetCode => "Reset code is invalid or expired.",
        ApiTextKey.PasswordResetCompleted => "Password reset complete. Please sign in with your new password.",
        ApiTextKey.PasswordChanged => "Password changed successfully.",
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
        ApiTextKey.PasswordTooShort => "Lösenordet måste vara minst 12 tecken långt.",
        ApiTextKey.PasswordRequiresUppercase => "Lösenordet måste innehålla minst en stor bokstav.",
        ApiTextKey.PasswordRequiresLowercase => "Lösenordet måste innehålla minst en liten bokstav.",
        ApiTextKey.PasswordRequiresDigit => "Lösenordet måste innehålla minst en siffra.",
        ApiTextKey.PasswordRequiresSpecialCharacter => "Lösenordet måste innehålla minst ett specialtecken.",
        ApiTextKey.PasswordMustBeDifferent => "Det nya lösenordet måste skilja sig från det nuvarande.",
        ApiTextKey.InvalidRefreshToken => "Refresh token är ogiltig eller har gått ut.",
        ApiTextKey.PasswordResetRequested => "Om kontot finns har en återställningskod skapats.",
        ApiTextKey.InvalidPasswordResetCode => "Återställningskoden är ogiltig eller har gått ut.",
        ApiTextKey.PasswordResetCompleted => "Lösenordet har återställts. Logga in med ditt nya lösenord.",
        ApiTextKey.PasswordChanged => "Lösenordet har uppdaterats.",
        ApiTextKey.RecipeNotFound => "Receptet kunde inte hittas.",
        ApiTextKey.RecipeDeleted => "Receptet har tagits bort.",
        ApiTextKey.OtherSessionsRevoked => "Övriga sessioner har återkallats.",
        ApiTextKey.SessionNotFound => "Sessionen kunde inte hittas.",
        ApiTextKey.SessionRevoked => "Sessionen har återkallats.",
        ApiTextKey.SessionAlreadyRevoked => "Sessionen är redan återkallad.",
        _ => "Okänt fel."
    };
}