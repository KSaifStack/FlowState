using System.Security.Claims;
using AspNet.Security.OAuth.GitHub;
using FlowState.Backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Data Protection key ring persisted on disk so encryption survives restarts.
// (These keys protect the encrypted token file contents.)
builder.Services
    .AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "FlowState", "dp_keys")
    ));

builder.Services.AddSingleton<IGitHubTokenStore, FileGitHubTokenStore>();
builder.Services.AddHttpClient<GitHubApi>();
builder.Services.AddHttpClient<AiService>();
builder.Services.AddSingleton<GitService>();

// CORS: allow credentials (cookie auth). Cannot use AllowAnyOrigin with cookies.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .SetIsOriginAllowed(_ => true) // Electron-safe (local-only app)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services
    .AddAuthentication(options =>
    {
        // Make cookies the default for auth checks and challenges
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.Cookie.Name = "flowstate_auth";
        options.Cookie.HttpOnly = true;

        // Electron + localhost over HTTP
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;

        // Avoid weird domain issues between localhost vs 127.0.0.1
        options.Cookie.Domain = null;
        options.Cookie.Path = "/";

        // Helpful for APIs: return 401 instead of redirecting to a login page
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    })
    .AddGitHub("GitHub", options =>
    {
        options.ClientId = builder.Configuration["GITHUB_CLIENT_ID"] ?? "";
        options.ClientSecret = builder.Configuration["GITHUB_CLIENT_SECRET"] ?? "";
        options.CallbackPath = "/auth/github/callback";

        options.Scope.Add("read:user");
        options.Scope.Add("repo");

        // IMPORTANT: we store tokens encrypted-at-rest ourselves (not in cookie)
        options.SaveTokens = false;

        options.Events.OnCreatingTicket = async context =>
        {
            var id = context.User.GetProperty("id").GetInt64().ToString();
            var login = context.User.GetProperty("login").GetString() ?? "unknown";
            var scope = context.TokenResponse?.Response?.RootElement.TryGetProperty("scope", out var s) == true
                ? (s.GetString() ?? "")
                : "";

            if (string.IsNullOrWhiteSpace(context.AccessToken))
            {
                context.Fail("GitHub did not return an access token.");
                return;
            }

            var store = context.HttpContext.RequestServices.GetRequiredService<IGitHubTokenStore>();
            await store.SaveAsync(id, login, context.AccessToken, scope);

            context.Identity!.AddClaim(new Claim("github:id", id));
            context.Identity.AddClaim(new Claim("github:login", login));
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors();

// DO NOT redirect to HTTPS because Electron starts backend on http://127.0.0.1:5180
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// IMPORTANT:
// Removed minimal API /auth/me here to avoid having two endpoints for the same route.
// /auth/me should be served by AuthController only.

app.Run();
