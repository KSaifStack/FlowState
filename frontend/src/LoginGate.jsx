import { useEffect, useState } from 'react';
import './App.css';
import TitleBar from './components/TitleBar.jsx';
import GithubIcon from './assets/images/Github.png';

const BACKEND = 'http://127.0.0.1:5180';

function LoginGate({ onAuth, onGitHubLogin }) {
    const [status, setStatus] = useState('checking'); // checking | anon | authed
    const [error, setError] = useState(null);

    async function refreshAuth() {
        setError(null);
        try {
            const res = await fetch(`${BACKEND}/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (res.status === 401) {
                setStatus('anon');
                return;
            }

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `Unexpected status ${res.status}`);
            }

            const data = await res.json();
            onGitHubLogin?.(data.githubLogin ?? null);
            // baka onGitHubLogin?.(data.githubLogin ?? null);

            setStatus('authed');
            onAuth('github'); // only switch after backend confirms session
        } catch (e) {
            setStatus('anon');
            setError(e?.message || String(e));
        }
    }

    useEffect(() => {
        // Initial check
        refreshAuth();

        // Light polling fallback (covers cases where deep link is blocked)
        const poll = setInterval(() => {
            if (status !== 'authed') refreshAuth();
        }, 1500);

        // Instant refresh when Electron receives flowstate://oauth-complete
        window.electronAPI?.onOAuthComplete?.(async ({ code }) => {
            if (!code) return;

            await fetch(`${BACKEND}/auth/exchange?code=${encodeURIComponent(code)}`, {
                method: "POST",
                credentials: "include",
            });

            // Now the cookie exists in Electron session
            refreshAuth();
        });


        return () => clearInterval(poll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginWithGithub = async () => {
        setError(null);
        try {
            await window.electronAPI.startGitHubLogin();
            // No manual button; deep-link event or polling will detect the session.
        } catch (e) {
            setError(e?.message || String(e));
        }
    };

    const loginLocal = () => onAuth('local');

    return (
        <div className="login-screen">
            <TitleBar authState="guest" />
            <div className="login-container">
                <div className="center-panel">
                    <p className="Title">FlowState</p>
                    <p className="Subtext">
                        {status === 'checking' ? 'Checking session…' : 'AI–Powered Project Manager.'}
                    </p>

                    <button className="Github-button" onClick={loginWithGithub}>
                        <img src={GithubIcon} alt="Github" className="github-icon" />
                        Sign in with GitHub
                    </button>

                    <button className="Local-button" onClick={loginLocal}>
                        Sign in as a Local User
                    </button>

                    {error && <p style={{ marginTop: 12, color: 'crimson' }}>{error}</p>}
                </div>
            </div>
        </div>
    );
}

export default LoginGate;
