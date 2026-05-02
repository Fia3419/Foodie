using System.Security.Cryptography;
using System.Text;
using Foodie.Api.Localization;

namespace Foodie.Api.Auth;

public static class PasswordSecurity
{
    private const int ResetCodeLength = 10;
    private const string ResetCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static ApiTextKey? ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 12)
        {
            return ApiTextKey.PasswordTooShort;
        }

        if (!password.Any(char.IsUpper))
        {
            return ApiTextKey.PasswordRequiresUppercase;
        }

        if (!password.Any(char.IsLower))
        {
            return ApiTextKey.PasswordRequiresLowercase;
        }

        if (!password.Any(char.IsDigit))
        {
            return ApiTextKey.PasswordRequiresDigit;
        }

        if (!password.Any(static character => !char.IsLetterOrDigit(character)))
        {
            return ApiTextKey.PasswordRequiresSpecialCharacter;
        }

        return null;
    }

    public static string CreateResetCode()
    {
        Span<byte> bytes = stackalloc byte[ResetCodeLength];
        RandomNumberGenerator.Fill(bytes);
        var builder = new StringBuilder(ResetCodeLength);

        foreach (var value in bytes)
        {
            builder.Append(ResetCodeAlphabet[value % ResetCodeAlphabet.Length]);
        }

        return builder.ToString();
    }

    public static string HashResetCode(string resetCode)
    {
        var normalizedCode = resetCode.Trim().ToUpperInvariant();
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalizedCode));
        return Convert.ToHexString(hashBytes);
    }
}