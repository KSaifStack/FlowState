using FlowState.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AiController : ControllerBase
    {
        private readonly AiService _aiService;

        public AiController(AiService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("insights")]
        public async Task<IActionResult> GetInsights([FromQuery] string path, [FromQuery] string? githubId = null)
        {
            if (string.IsNullOrWhiteSpace(path))
                return BadRequest("Path is required");

            var message = await _aiService.GetProjectInsightsAsync(path, githubId);
            return Ok(new { message });
        }

        [HttpGet("goals")]
        public async Task<IActionResult> GetGoals([FromQuery] string path, [FromQuery] string? githubId = null)
        {
            if (string.IsNullOrWhiteSpace(path))
                return BadRequest("Path is required");

            var goals = await _aiService.GetProposedGoalsAsync(path, githubId);
            return Ok(new { goals });
        }
    }
}
