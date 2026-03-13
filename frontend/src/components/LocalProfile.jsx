import { useState, useEffect, useRef } from 'react';
import '../App.css';

function LocalProfile({ onSignOut }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const closeDropdown = () => {
        setShowDropdown(false);
    };

    const handleSignOut = () => {
        if (onSignOut) onSignOut();
        closeDropdown();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className="github-profile"
            ref={dropdownRef}
            style={{ position: 'relative' }}
        >
            <div className="user-footer" onClick={toggleDropdown}>
                <div className="local-user-avatar">?</div>
                <div className="user-info">
                    <div className="github-username">Local User</div>
                </div>
            </div>

            {showDropdown && (
                <div className="gitdrop-container">
                    <div
                        className="gitdropdown-option"
                        onClick={handleSignOut}
                    >
                        <span className="option-label">Sign Out</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocalProfile;
