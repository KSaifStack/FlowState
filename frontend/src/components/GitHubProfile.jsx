import { useState, useEffect, useRef } from 'react';
import '../App.css';

function GitHubProfile({ username, onSignOut }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const closeDropdown = () => {
        setShowDropdown(false);
    };

    const handleViewProfile = () => {
        console.log('View Profile clicked');
        closeDropdown();
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
                <img
                    src={`https://github.com/${username}.png`}
                    alt="GitHub Profile"
                    className="github-avatar"
                />
                <div className="user-info">
                    <div className="github-username">{username}</div>
                </div>
            </div>

            {showDropdown && (
                <div className="gitdrop-container">
                    <div
                        className="gitdropdown-option"
                        onClick={handleViewProfile}
                    >
                        <span className="option-label">View Profile</span>
                    </div>

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

export default GitHubProfile;
