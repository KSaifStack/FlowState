import { useEffect, useState } from 'react';
import LoginGate from './LoginGate.jsx';
import App from './App.jsx';

const BACKEND = 'http://127.0.0.1:5180';
const TOKEN_KEY = 'flowstate_token';

function AppRoot() {
    const [authState, setAuthState] = useState('guest'); // 'guest' | 'github' | 'local'
    const [githubLogin, setGithubLogin] = useState(null);

    const handleSignOut = async () => {
        // Attempt to tell backend to drop the session (bearer or cookie).
        try {
            const token = (() => {
                try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
            })();

            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            // Fire logout request; ignore failures but always clear local state after.
            await fetch(`${BACKEND}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers,
            });
        } catch (e) {
            console.warn('logout request failed', e);
        }

        // Remove stored token locally and update UI state.
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }

        setAuthState('guest');
        setGithubLogin(null);
    };

    // Auto-restore session if cookie exists
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${BACKEND}/auth/me`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setAuthState('github');
                    setGithubLogin(data.githubLogin ?? null);
                }
            } catch {
                // ignore
            }
        })();
    }, []);

    if (authState === 'guest') {
        return (
            <LoginGate
                onAuth={setAuthState}
                onGitHubLogin={(login) => setGithubLogin(login)}
            />
        );
    }

    return (
        <App
            authState={authState}
            githubLogin={githubLogin}
            onSignOut={handleSignOut}
        />
    );
}

export default AppRoot;
