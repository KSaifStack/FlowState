using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/projdirectory")]
public class ProjDirectoryController : ControllerBase
{
    private readonly ProjDirectoryService _service;

    public ProjDirectoryController(ProjDirectoryService service)
    {
        _service = service;
    }

    [HttpPost("send")]
    public IActionResult ReceiveData([FromBody] PathDto data)
    {
        if (string.IsNullOrWhiteSpace(data?.Path))
            return BadRequest("Path is required");

        try
        {
            // Call the service with the path. Set second arg to false if you don't want to open it.
            var result = _service.HandlePath(data.Path, openInFileManager: true);
            return Ok(result);
        }
        catch (System.IO.FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (System.Exception ex)
        {
            // Log the exception as needed
            return StatusCode(500, ex.Message);
        }
    }
}

public class PathDto
{
    public string Path { get; set; } = "";
}