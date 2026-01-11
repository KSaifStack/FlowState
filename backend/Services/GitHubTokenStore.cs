namespace FlowState.Backend.Services;

public record GitHubAuthRecord(
    string GitHubUserId,
    string Login,
    string ProtectedAccessToken,
    string Scope,
    DateTimeOffset SavedAtUtc
);

public interface IGitHubTokenStore
{
    Task SaveAsync(string gitHubUserId, string login, string accessToken, string scope);
    Task<GitHubAuthRecord?> GetAsync(string gitHubUserId);
}
