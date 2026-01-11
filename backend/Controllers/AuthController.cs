using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        // single-use codes: code -> (principal, expiry)
        private static readonly ConcurrentDictionary<string, (System.Security.Claims.ClaimsPrincipal principal, DateTimeOffset expiresUtc)>
            _codes = new();

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

        [HttpPost("/auth/exchange")]
        public async Task<IActionResult> Exchange([FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { error = "Missing code." });

            if (!_codes.TryRemove(code, out var entry))
                return Unauthorized(new { error = "Invalid or already-used code." });

            if (DateTimeOffset.UtcNow > entry.expiresUtc)
                return Unauthorized(new { error = "Code expired." });

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                entry.principal);

            return Ok(new { ok = true });
        }
    }
}
