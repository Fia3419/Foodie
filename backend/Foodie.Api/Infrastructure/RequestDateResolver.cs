using System.Globalization;

namespace Foodie.Api.Infrastructure;

public static class RequestDateResolver
{
    private const string TimezoneOffsetHeaderName = "X-Timezone-Offset-Minutes";
    private const string IsoDateFormat = "yyyy-MM-dd";

    public static DateOnly GetCurrentLocalDate(HttpRequest request)
    {
        var offsetMinutes = GetTimezoneOffsetMinutes(request);
        var localNow = DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromMinutes(-offsetMinutes));
        return DateOnly.FromDateTime(localNow.DateTime);
    }

    public static bool TryParseIsoDate(string value, out DateOnly date)
    {
        return DateOnly.TryParseExact(value, IsoDateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
    }

    private static int GetTimezoneOffsetMinutes(HttpRequest request)
    {
        if (!int.TryParse(request.Headers[TimezoneOffsetHeaderName], NumberStyles.Integer, CultureInfo.InvariantCulture, out var offsetMinutes))
        {
            return 0;
        }

        return Math.Clamp(offsetMinutes, -14 * 60, 14 * 60);
    }
}