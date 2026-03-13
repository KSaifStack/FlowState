using Microsoft.AspNetCore.DataProtection;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace FlowState.Backend.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly IGitHubTokenStore _tokenStore;
        private readonly IDataProtector _protector;

        public AiService(HttpClient httpClient, IGitHubTokenStore tokenStore, IDataProtectionProvider dp)
        {
            _httpClient = httpClient;
            _tokenStore = tokenStore;
            _protector = dp.CreateProtector("FlowState.GitHubToken.v1");
        }

        public async Task<string> GetProjectInsightsAsync(string projectPath, string? githubId = null)
        {
            if (string.IsNullOrWhiteSpace(projectPath) || !Directory.Exists(projectPath))
                return "No insights available. Please select a valid project directory.";

            try
            {
                // 1. Get Token
                string? token = null;
                if (!string.IsNullOrEmpty(githubId))
                {
                    var record = await _tokenStore.GetAsync(githubId);
                    if (record != null)
                    {
                        token = _protector.Unprotect(record.ProtectedAccessToken);
                    }
                }
                
                // Fallback: search for any token if none provided (common for local single-user apps)
                if (string.IsNullOrEmpty(token))
                {
                    // This is a bit hacky but works for the hackathon context
                    // In a real app we'd want strict user-session binding
                    var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "FlowState");
                    var path = Path.Combine(dir, "github_tokens.json");
                    if (File.Exists(path))
                    {
                        var json = await File.ReadAllTextAsync(path);
                        var map = JsonSerializer.Deserialize<Dictionary<string, GitHubAuthRecord>>(json);
                        if (map != null && map.Count > 0)
                        {
                            var first = map.Values.GetEnumerator();
                            if (first.MoveNext())
                            {
                                token = _protector.Unprotect(first.Current.ProtectedAccessToken);
                            }
                        }
                    }
                }

                if (string.IsNullOrEmpty(token))
                    return "AI Insights require a GitHub login. Please sign in with GitHub to enable this feature.";

                // 2. Gather Context
                var context = GatherContext(projectPath);

                // 3. Call GitHub Models API
                var requestBody = new
                {
                    model = "gpt-4o-mini",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a helpful project assistant for the FlowState app. Analyze the project metadata and provide a single, concise, encouraging insight or suggest a next step for the developer. Keep it under 2 sentences." },
                        new { role = "user", content = $"Project Path: {projectPath}\nContext:\n{context}" }
                    },
                    max_tokens = 100
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://models.inference.ai.azure.com/chat/completions");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return $"AI error: {response.StatusCode}. Make sure you have access to GitHub Models.";
                }

                var resultJson = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(resultJson);
                var message = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                return message ?? "No insights generated.";
            }
            catch (Exception ex)
            {
                return $"Failed to fetch AI insights: {ex.Message}";
            }
        }

        public async Task<List<string>> GetProposedGoalsAsync(string projectPath, string? githubId = null)
        {
            if (string.IsNullOrWhiteSpace(projectPath) || !Directory.Exists(projectPath))
                return new List<string> { "Initialize project structure", "Setup development environment" };

            try
            {
                // 1. Get Token (reuse logic from GetProjectInsightsAsync)
                string? token = null;
                if (!string.IsNullOrEmpty(githubId))
                {
                    var record = await _tokenStore.GetAsync(githubId);
                    if (record != null) token = _protector.Unprotect(record.ProtectedAccessToken);
                }
                
                if (string.IsNullOrEmpty(token))
                {
                    var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "FlowState");
                    var path = Path.Combine(dir, "github_tokens.json");
                    if (File.Exists(path))
                    {
                        var json = await File.ReadAllTextAsync(path);
                        var map = JsonSerializer.Deserialize<Dictionary<string, GitHubAuthRecord>>(json);
                        if (map != null && map.Count > 0)
                        {
                            var first = map.Values.GetEnumerator();
                            if (first.MoveNext()) token = _protector.Unprotect(first.Current.ProtectedAccessToken);
                        }
                    }
                }

                if (string.IsNullOrEmpty(token))
                    return new List<string> { "Sign in with GitHub to get AI goals", "Connect repository", "Define technical stack" };

                // 2. Gather Context
                var context = GatherContext(projectPath);

                // 3. Call GitHub Models API
                var requestBody = new
                {
                    model = "gpt-4o-mini",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a senior developer assistant. Analyze the project context and suggest 3 concrete, short technical goals for this project. Return ONLY a JSON array of strings. No extra text." },
                        new { role = "user", content = $"Project Context:\n{context}" }
                    },
                    max_tokens = 150
                };

                var request = new HttpRequestMessage(HttpMethod.Post, "https://models.inference.ai.azure.com/chat/completions");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode) return new List<string> { "Add unit tests", "Refactor core logic", "Document API endpoints" };

                var resultJson = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(resultJson);
                var message = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                if (string.IsNullOrEmpty(message)) return new List<string> { "Set up CI/CD", "Improve error handling", "Optimize performance" };

                // Clean up message if it has markdown code blocks
                if (message.Contains("```json")) message = message.Split("```json")[1].Split("```")[0];
                else if (message.Contains("```")) message = message.Split("```")[1].Split("```")[0];

                var goals = JsonSerializer.Deserialize<List<string>>(message);
                return goals ?? new List<string> { "Review codebase", "Update dependencies", "Fix open issues" };
            }
            catch
            {
                return new List<string> { "Explore architecture", "Implement new features", "Verify build status" };
            }
        }

        private string GatherContext(string path)
        {
            var sb = new StringBuilder();
            try
            {
                var files = Directory.GetFiles(path, "*.*", SearchOption.TopDirectoryOnly);
                sb.AppendLine("Root Files: " + string.Join(", ", files.Select(Path.GetFileName)));

                foreach (var file in files)
                {
                    var name = Path.GetFileName(file).ToLower();
                    var ext = Path.GetExtension(file).ToLower();

                    // Only read text-based files that aren't too massive
                    if (name == "package.json" || name == "readme.md" || name == "appsettings.json" || 
                        ext == ".cs" || ext == ".js" || ext == ".jsx" || ext == ".ts" || ext == ".tsx" || 
                        ext == ".py" || ext == ".go" || ext == ".rs" || ext == ".java")
                    {
                        try 
                        {
                            var content = File.ReadLines(file).Take(25);
                            sb.AppendLine($"\n--- Content: {name} ---");
                            sb.AppendLine(string.Join("\n", content));
                        } catch { /* skip if can't read */ }
                    }
                }
            }
            catch { /* ignore context gathering errors */ }
            return sb.ToString();
        }
    }
}
