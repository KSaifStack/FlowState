using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace FlowState.Backend.Services
{
    public class GitService
    {
        public async Task<List<CommitInfo>> GetCommitHistoryAsync(string projectPath, int count = 5)
        {
            if (string.IsNullOrWhiteSpace(projectPath) || !Directory.Exists(projectPath))
                return new List<CommitInfo>();

            // Check if it's a git repo
            if (!Directory.Exists(Path.Combine(projectPath, ".git")))
                return new List<CommitInfo>();

            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "git",
                    Arguments = $"log -n {count} --pretty=format:\"%h|%an|%ar|%s\"",
                    WorkingDirectory = projectPath,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(psi);
                if (process == null) return new List<CommitInfo>();

                string output = await process.StandardOutput.ReadToEndAsync();
                await process.WaitForExitAsync();

                return output.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Select(line =>
                    {
                        var parts = line.Split('|');
                        return new CommitInfo
                        {
                            Hash = parts.Length > 0 ? parts[0] : "",
                            Author = parts.Length > 1 ? parts[1] : "",
                            Date = parts.Length > 2 ? parts[2] : "",
                            Message = parts.Length > 3 ? parts[3] : ""
                        };
                    }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching git history: {ex.Message}");
                return new List<CommitInfo>();
            }
        }

        public async Task<int> GetTotalCommitsAsync(string projectPath)
        {
            if (string.IsNullOrWhiteSpace(projectPath) || !Directory.Exists(projectPath) || !Directory.Exists(Path.Combine(projectPath, ".git")))
                return 0;

            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "git",
                    Arguments = "rev-list --count HEAD",
                    WorkingDirectory = projectPath,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(psi);
                if (process == null) return 0;

                string output = await process.StandardOutput.ReadToEndAsync();
                await process.WaitForExitAsync();

                return int.TryParse(output.Trim(), out int count) ? count : 0;
            }
            catch
            {
                return 0;
            }
        }
    }

    public class CommitInfo
    {
        public string Hash { get; set; } = "";
        public string Author { get; set; } = "";
        public string Date { get; set; } = "";
        public string Message { get; set; } = "";
    }
}
