using System;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace FlowState.Backend.Services;

public sealed class GitHubApi
{
    private readonly HttpClient _http;

    public GitHubApi(HttpClient http)
    {
        _http = http;
        _http.BaseAddress = new Uri("https://api.github.com/");
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("FlowState");
        _http.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
    }

    public async Task<JsonElement> ListReposAsync(string accessToken)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, "user/repos?per_page=100&sort=updated");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var res = await _http.SendAsync(req);
        var body = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"GitHub API error {(int)res.StatusCode}: {body}");

        return JsonDocument.Parse(body).RootElement.Clone();
    }
}
