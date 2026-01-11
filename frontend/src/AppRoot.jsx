import { useEffect, useState } from 'react';
import LoginGate from './LoginGate.jsx';
import App from './App.jsx';

const BACKEND = 'http://127.0.0.1:5180';

function AppRoot() {
    const [authState, setAuthState] = useState('guest'); // 'guest' | 'github' | 'local'
    const [githubLogin, setGithubLogin] = useState(null);

    const handleSignOut = () => {
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
