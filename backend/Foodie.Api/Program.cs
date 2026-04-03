using System.Text;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using Foodie.Api.Auth;
using Foodie.Api.Data;
using Foodie.Api.Entities;
using Foodie.Api.Localization;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetRequiredSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddDbContext<FoodieDbContext>((serviceProvider, options) =>
    FoodieDbContextFactory.ConfigureProvider(options, builder.Configuration));
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordHasher<FoodieUser>, PasswordHasher<FoodieUser>>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddLocalization();
builder.Services.AddSingleton<IApiTextLocalizer, ApiTextLocalizer>();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var localizer = context.HttpContext.RequestServices.GetRequiredService<IApiTextLocalizer>();
        var problemDetails = new ValidationProblemDetails(context.ModelState)
        {
            Title = localizer.Get(ApiTextKey.ValidationFailedTitle),
            Detail = localizer.Get(ApiTextKey.ValidationFailedDetail),
            Status = StatusCodes.Status400BadRequest
        };

        return new BadRequestObjectResult(problemDetails);
    };
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
var jwtOptions = builder.Configuration.GetRequiredSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT configuration is missing.");

Validator.ValidateObject(jwtOptions, new ValidationContext(jwtOptions), validateAllProperties: true);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey))
        };
    });
builder.Services.AddAuthorization();
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()?
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .ToArray() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FoodieFrontend", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins);
        }
        else
        {
            policy.AllowAnyOrigin();
        }

        policy
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

var supportedCultures = new[] { new CultureInfo("en"), new CultureInfo("sv") };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("en"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures,
    RequestCultureProviders =
    [
        new AcceptLanguageHeaderRequestCultureProvider()
    ]
});

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FoodieDbContext>();
    await dbContext.Database.MigrateAsync();
    await DbSeeder.SeedAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("FoodieFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
