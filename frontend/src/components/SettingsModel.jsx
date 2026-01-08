import { useState, useEffect, useRef } from 'react';
import '../App.css';
import logo from '../assets/images/logo.png';

function SettingsModel({ theme, setTheme }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);


    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const closeDropdown = () => {
        setShowDropdown(false);
    };


    const handleGetVersion = () => {
        // TODO: Fetch app version from backend / Electron
        // Example later:
        // const version = await window.electronAPI.app.getVersion();
        console.log('Get app version');
    };

    const handleOpenAbout = () => {
        // TODO: Open About modal / window
        // Example later:
        // window.electronAPI.openAboutWindow();
        console.log('Open About FlowState');
        closeDropdown();
    };

    const handleToggleTheme = () => {
        // UI state change
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);

        // TODO: Persist theme preference
        // Example later:
        // window.electronAPI.settings.setTheme(newTheme);
        console.log('Theme switched to:', newTheme);

        closeDropdown();
    };



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <button
                ref={buttonRef}
                className="Titlebutton"
                onClick={toggleDropdown}
            >
                <img id="TitleImage" src={logo} alt="App Logo" />
            </button>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="settings-dropdown"
                >
                    <div
                        className="settings-option"
                        onClick={handleGetVersion}
                    >
                        Version 1.0.0
                    </div>

                    <div
                        className="settings-option"
                        onClick={handleOpenAbout}
                    >
                        About FlowState
                    </div>

                    <div
                        className="settings-option"
                        onClick={handleToggleTheme}
                    >
                        Theme: {theme === 'dark' ? 'Dark' : 'Light'}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsModel;
