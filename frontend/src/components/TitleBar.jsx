import '../App.css';
import { useState } from 'react';
import logo from '../assets/images/logo.png';
import GithubModel from './GithubProfile.jsx';
import SettingsModel from './SettingsModel.jsx';

function TitleBar({ authState, githubLogin, onSignOut }) {
    const [theme, setTheme] = useState('dark');

    return (
        <div className="title-bar">
            <SettingsModel theme={theme} setTheme={setTheme}>
                <button className="Titlebutton">
                    <img src={logo} alt="App Logo" />
                </button>
            </SettingsModel>

            <div className="window-controls">
                {authState !== 'guest' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10 }}>
                        {authState === 'github' && githubLogin && (
                            <span style={{ fontSize: 12, opacity: 0.85 }}>@{githubLogin}</span>
                        )}

                        {onSignOut && (
                            <button onClick={onSignOut} style={{ fontSize: 12 }}>
                                Sign out
                            </button>
                        )}

                        <GithubModel />
                    </div>
                )}

                <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
                <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
                <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
            </div>
        </div>
    );
}

export default TitleBar;
