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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

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
                    <div className="settings-option">
                        Version 1.0.0
                    </div>

                    <div className="settings-option">
                        About FlowState
                    </div>

                    <div className="settings-option" onClick={toggleTheme}>
                        Theme: {theme === 'dark' ? 'Dark' : 'Light'}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsModel;
