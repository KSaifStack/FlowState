using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    [Route("api/importjson")]
    public class ImportJSONController : ControllerBase
    {
        private static readonly string ProjectsDir = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "electron", "projects")
        );

        [HttpPost("send")]
        public IActionResult ReceiveData([FromBody] PathDto data)
        {
            if (string.IsNullOrWhiteSpace(data.Path))
                return BadRequest("Path is required");

            string filePath = data.Path;

            if (!Path.IsPathRooted(filePath))
                filePath = Path.Combine(ProjectsDir, data.Path);

            if (!System.IO.File.Exists(filePath))
                return BadRequest($"File not found: {filePath}");

            try
            {
                string jsonContent = System.IO.File.ReadAllText(filePath);

                // Case-insensitive deserialization ensures JSON keys match C# properties
                var loadedProject = JsonSerializer.Deserialize<ProjectPayload>(
                    jsonContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        ReadCommentHandling = JsonCommentHandling.Skip,
                        AllowTrailingCommas = true
                    }
                );

                if (loadedProject == null)
                    return BadRequest("Invalid project file");

                return Ok(new { projectPayload = loadedProject });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error loading project: {ex.Message}");
            }
        }
    }

    public class PathDto
    {
        [JsonPropertyName("path")]
        public string Path { get; set; } = string.Empty;
    }

    public class ProjectPayload
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("icon")]
        public string? IconClass { get; set; }

        [JsonPropertyName("projectType")]
        public string? ProjectType { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("subtitle")]
        public string? Subtitle { get; set; }

        [JsonPropertyName("date")]
        public string? Date { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("isPinned")]
        public bool IsPinned { get; set; }

        [JsonPropertyName("workflow")]
        public List<WorkFlowStepPayload> WorkFlow { get; set; } = new();

        [JsonPropertyName("path")]
        public string? Path { get; set; }

        [JsonPropertyName("commits")]
        public int Commits { get; set; }

        [JsonPropertyName("dailyCommits")]
        public int DailyCommits { get; set; }

        [JsonPropertyName("techStack")]
        public string[] TechStack { get; set; } = Array.Empty<string>();

        [JsonPropertyName("goals")]
        public string[] Goals { get; set; } = Array.Empty<string>();

        [JsonPropertyName("insights")]
        public string? Insights { get; set; }

        [JsonPropertyName("lastOpenedDays")]
        public int LastOpenedDays { get; set; }
    }

    public class WorkFlowStepPayload
    {
        [JsonPropertyName("name")]
        public string name { get; set; } = string.Empty;

        [JsonPropertyName("path")]
        public string path { get; set; } = string.Empty;
    }
}
