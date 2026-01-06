using Microsoft.AspNetCore.Mvc;
using System.IO;

[ApiController]
[Route("api/projdirectory")]
public class ProjDirectoryController : ControllerBase
{
    [HttpPost("send")]
    public IActionResult ReceiveData([FromBody] PathDto data)
    {
        if (string.IsNullOrWhiteSpace(data.Path))
            return BadRequest("Path is required");

        var fileName = Path.GetFileNameWithoutExtension(data.Path);

        return Ok(new
        {
            name = fileName,
            path = data.Path
        });
    }
}

public class PathDto
{
    public string Path { get; set; } = "";
}
