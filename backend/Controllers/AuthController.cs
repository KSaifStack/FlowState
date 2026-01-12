using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        // one-time oauth codes: code -> (principal, expiry)
        private static readonly ConcurrentDictionary<string, (ClaimsPrincipal principal, DateTimeOffset expiresUtc)> _codes = new();

        // electron sessions: token -> (principal, expiry)
        private static readonly ConcurrentDictionary<string, (ClaimsPrincipal principal, DateTimeOffset expiresUtc)> _sessions = new();

        private static ClaimsPrincipal? TryGetBearerPrincipal(HttpRequest request)
        {
            if (!request.Headers.TryGetValue("Authorization", out var auth)) return null;
            var value = auth.ToString();
            if (string.IsNullOrWhiteSpace(value)) return null;
            if (!value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) return null;

            var token = value.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrWhiteSpace(token)) return null;

            if (!_sessions.TryGetValue(token, out var entry)) return null;
            if (DateTimeOffset.UtcNow > entry.expiresUtc)
            {
                _sessions.TryRemove(token, out _);
                return null;
            }

            return entry.principal;
        }

        private static string? GetClaim(ClaimsPrincipal principal, string type)
            => principal.Claims.FirstOrDefault(c => c.Type == type)?.Value;

        [HttpGet("/auth/github/login")]
        public IActionResult GitHubLogin()
        {
            var props = new AuthenticationProperties
            {
                RedirectUri = "/auth/github/done"
            };

            return Challenge(props, "GitHub");
        }

        [HttpGet("/auth/github/done")]
        public IActionResult Done()
        {
            if (User?.Identity?.IsAuthenticated != true)
                return Unauthorized("Not authenticated.");

            var code = Guid.NewGuid().ToString("N");
            var principal = User;

            _codes[code] = (principal, DateTimeOffset.UtcNow.AddSeconds(60));

            return Redirect($"flowstate://oauth-complete?code={code}");
        }

        // Electron calls this with the one-time code from the deep link.
        // Returns a bearer token that Electron can send on every API call.
        [HttpPost("/auth/exchange")]
        public IActionResult Exchange([FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { error = "Missing code." });

            if (!_codes.TryRemove(code, out var entry))
                return Unauthorized(new { error = "Invalid or already-used code." });

            if (DateTimeOffset.UtcNow > entry.expiresUtc)
                return Unauthorized(new { error = "Code expired." });

            // Create a session token for Electron (7 days)
            var token = Guid.NewGuid().ToString("N");
            _sessions[token] = (entry.principal, DateTimeOffset.UtcNow.AddDays(7));

            // (Optional) also issue cookie for browser-based use; Electron can ignore it
            HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, entry.principal).GetAwaiter().GetResult();

            return Ok(new { ok = true, token });
        }

        [HttpGet("/auth/me")]
        public async Task<IActionResult> Me()
        {
            // Prefer bearer (Electron), fallback to cookie (browser)
            var bearerPrincipal = TryGetBearerPrincipal(Request);
            if (bearerPrincipal != null)
            {
                var login = GetClaim(bearerPrincipal, "github:login") ?? bearerPrincipal.Identity?.Name;
                var id = GetClaim(bearerPrincipal, "github:id");

                return Ok(new { authenticated = true, githubId = id, githubLogin = login });
            }

            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded || result.Principal?.Identity?.IsAuthenticated != true)
                return Unauthorized();

            var principal = result.Principal;
            var login2 = GetClaim(principal, "github:login") ?? principal.Identity?.Name;
            var id2 = GetClaim(principal, "github:id");

            return Ok(new { authenticated = true, githubId = id2, githubLogin = login2 });
        }

        [HttpPost("/auth/logout")]
        public async Task<IActionResult> Logout()
        {
            // If Electron sends Bearer, drop that session
            if (Request.Headers.TryGetValue("Authorization", out var auth))
            {
                var v = auth.ToString();
                if (v.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = v.Substring("Bearer ".Length).Trim();
                    if (!string.IsNullOrWhiteSpace(token))
                        _sessions.TryRemove(token, out _);
                }
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { ok = true });
        }
    }
}
