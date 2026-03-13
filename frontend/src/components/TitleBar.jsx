import '../App.css';
import { useState } from 'react';
import logo from '../assets/images/icon.png';
import GithubModel from './GitHubProfile.jsx';
import LocalProfile from './LocalProfile.jsx';
import SettingsModel from './SettingsModel.jsx';

function TitleBar({ authState, githubLogin, onSignOut }) {
    const [theme, setTheme] = useState('dark');

    return (
        <div className="title-bar">
            <SettingsModel theme={theme} setTheme={setTheme}>
                <button className="Titlebutton">
                    <img src={logo} alt="App Logo" className="Title-icon" />
                </button>
            </SettingsModel>

            <div className="window-controls">
                {githubLogin !== "Local User" ? (
                    <GithubModel
                        username={githubLogin}
                        onSignOut={onSignOut}
                    />
                ) : (
                    <LocalProfile onSignOut={onSignOut} />
                )}

                <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
                <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
                <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
            </div>
        </div>
    );
}

export default TitleBar;
