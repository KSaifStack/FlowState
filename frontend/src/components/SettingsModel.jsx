import { useState, useEffect, useRef } from 'react';
import '../App.css';
import logo from '../assets/images/icon.png';

function SettingsModel({ children, theme, setTheme }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Initial theme load
    useEffect(() => {
        const savedTheme = localStorage.getItem('flowstate-theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, [setTheme]);

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
        setShowAbout(true);
        closeDropdown();
    };

    const handleToggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('flowstate-theme', newTheme);
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
            {/* Toggle Button - uses children if provided */}
            {children ? (
                <div 
                    ref={buttonRef} 
                    onClick={toggleDropdown}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    {children}
                </div>
            ) : (
                <button
                    ref={buttonRef}
                    className="Titlebutton"
                    onClick={toggleDropdown}
                >
                    <img id="TitleImage" src={logo} alt="App Logo" />
                </button>
            )}

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="settings-dropdown"
                >
                    <div
                        className="settings-option"
                        onClick={handleGetVersion}
                    >
                        Version 0.0.1
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
