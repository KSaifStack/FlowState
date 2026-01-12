import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import TitleBar from './components/TitleBar.jsx';
import GithubIcon from './assets/images/Github.png';

const BACKEND = 'http://127.0.0.1:5180';
const TOKEN_KEY = 'flowstate_token';

function LoginGate({ onAuth, onGitHubLogin }) {
    const [status, setStatus] = useState('checking'); // checking | anon | authed
    const [error, setError] = useState(null);

    const authedRef = useRef(false);
    const isRefreshingRef = useRef(false);
    const isExchangingRef = useRef(false);

    const getToken = () => {
        try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
    };

    const setToken = (token) => {
        try {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            else localStorage.removeItem(TOKEN_KEY);
        } catch { /* ignore */ }
    };

    const refreshAuth = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;

        try {
            setError(null);

            const token = getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            const res = await fetch(`${BACKEND}/auth/me`, {
                method: 'GET',
                credentials: 'include', // harmless; bearer is primary now
                headers,
            });

            if (res.status === 401) {
                authedRef.current = false;
                setStatus('anon');
                return;
            }

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `Unexpected status ${res.status}`);
            }

            const data = await res.json();
            onGitHubLogin?.(data.githubLogin ?? null);

            authedRef.current = true;
            setStatus('authed');
            onAuth('github');
        } catch (e) {
            authedRef.current = false;
            setStatus('anon');
            setError(e?.message || String(e));
        } finally {
            isRefreshingRef.current = false;
        }
    }, [onAuth, onGitHubLogin]);

    useEffect(() => {
        // check once on mount
        refreshAuth();

        const handler = async ({ code }) => {
            if (!code) return;
            if (isExchangingRef.current) return;
            isExchangingRef.current = true;

            try {
                setError(null);

                const res = await fetch(`${BACKEND}/auth/exchange?code=${encodeURIComponent(code)}`, {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!res.ok) {
                    const t = await res.text();
                    throw new Error(t || `Exchange failed (${res.status})`);
                }

                const data = await res.json();
                setToken(data?.token || null);

                await refreshAuth();
            } catch (e) {
                setToken(null);
                setError(e?.message || String(e));
                authedRef.current = false;
                setStatus('anon');
            } finally {
                isExchangingRef.current = false;
            }
        };

        const unsubscribe = window.electronAPI?.onOAuthComplete?.(handler);

        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginWithGithub = async () => {
        setError(null);
        try {
            await window.electronAPI.startGitHubLogin();
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
