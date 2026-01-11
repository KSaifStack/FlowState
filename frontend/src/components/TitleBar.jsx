import '../App.css';
import { useState } from 'react';
import logo from '../assets/images/logo.png';
import GithubModel from './GithubProfile.jsx';
import SettingsModel from './SettingsModel.jsx';

function TitleBar({ authState }) {
    const [theme, setTheme] = useState('dark');

    return (
        <div className="title-bar">
            <SettingsModel theme={theme} setTheme={setTheme}>
                <button className="Titlebutton">
                    <img src={logo} alt="App Logo" />
                </button>
            </SettingsModel>

            <div className="window-controls">
                {authState !== 'guest' && <GithubModel />}

                <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
                <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
                <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
            </div>
        </div>
    );
}

export default TitleBar;
