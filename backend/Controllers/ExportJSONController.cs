using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace FlowState.Backend.Controllers
{
    [ApiController]
    [Route("api/exportjson")]
    public class ExportJSONController : ControllerBase
    {
        private static readonly string ProjectsDir = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "electron", "projects")
        );

        [HttpPost("send")]
        public IActionResult ReceiveData([FromBody] ProjectDto projectData)
        {
            if (!Directory.Exists(ProjectsDir))
                Directory.CreateDirectory(ProjectsDir);

            // Use only the project ID for the filename
            string safeFileName = $"{projectData.Id}.json";
            string fullPath = Path.Combine(ProjectsDir, safeFileName);

            string json = JsonSerializer.Serialize(projectData, new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            System.IO.File.WriteAllText(fullPath, json, Encoding.UTF8);

            return Ok(new { path = fullPath });
        }

    }

    public class ProjectDto
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
        public List<WorkFlowStepDto> WorkFlow { get; set; } = new();

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

    public class WorkFlowStepDto
    {
        [JsonPropertyName("name")]
        public string? name { get; set; }

        [JsonPropertyName("path")]
        public string? path { get; set; }
    }
}
