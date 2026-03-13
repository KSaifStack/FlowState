using FlowState.Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    [Route("api/git")]
    public class GitController : ControllerBase
    {
        private readonly GitService _gitService;

        public GitController(GitService gitService)
        {
            _gitService = gitService;
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string path, [FromQuery] int count = 5)
        {
            if (string.IsNullOrWhiteSpace(path))
                return BadRequest("Path is required");

            var history = await _gitService.GetCommitHistoryAsync(path, count);
            var total = await _gitService.GetTotalCommitsAsync(path);

            return Ok(new { history, total });
        }
    }
}
