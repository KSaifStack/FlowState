using Microsoft.AspNetCore.DataProtection;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FlowState.Backend.Services;

public sealed class FileGitHubTokenStore : IGitHubTokenStore
{
    private readonly IDataProtector _protector;
    private readonly string _path;
    private readonly SemaphoreSlim _mutex = new(1, 1);

    public FileGitHubTokenStore(IDataProtectionProvider dp)
    {
        _protector = dp.CreateProtector("FlowState.GitHubToken.v1");
        var dir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "FlowState");
        Directory.CreateDirectory(dir);
        _path = Path.Combine(dir, "github_tokens.json");
    }

    public async Task SaveAsync(string gitHubUserId, string login, string accessToken, string scope)
    {
        var protectedToken = _protector.Protect(accessToken);

        await _mutex.WaitAsync();
        try
        {
            var map = await LoadAsync();
            map[gitHubUserId] = new GitHubAuthRecord(
                gitHubUserId,
                login,
                protectedToken,
                scope,
                DateTimeOffset.UtcNow
            );
            await File.WriteAllTextAsync(_path, JsonSerializer.Serialize(map, new JsonSerializerOptions { WriteIndented = true }));
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task<GitHubAuthRecord?> GetAsync(string gitHubUserId)
    {
        await _mutex.WaitAsync();
        try
        {
            var map = await LoadAsync();
            return map.TryGetValue(gitHubUserId, out var rec) ? rec : null;
        }
        finally
        {
            _mutex.Release();
        }
    }

    private async Task<Dictionary<string, GitHubAuthRecord>> LoadAsync()
    {
        if (!File.Exists(_path)) return new();
        var json = await File.ReadAllTextAsync(_path);
        return JsonSerializer.Deserialize<Dictionary<string, GitHubAuthRecord>>(json) ?? new();
    }

    // When you later need the plaintext token, call:
    // var token = _protector.Unprotect(record.ProtectedAccessToken);
}
