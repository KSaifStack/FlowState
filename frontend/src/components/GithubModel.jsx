import { useState, useEffect, useRef } from 'react';
import '../App.css';

function GitHubProfile() {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);


    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const closeDropdown = () => {
        setShowDropdown(false);
    };


    const handleViewProfile = () => {
        // TODO: Open GitHub profile
        // Example later:
        // window.electronAPI.openExternal(`https://github.com/username`);
        console.log('View Profile clicked');
        closeDropdown();
    };

    const handleSignOut = () => {
        // TODO: Clear auth tokens / session
        // Example later:
        // window.electronAPI.auth.signOut();
        console.log('Sign Out clicked');
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
                    src="https://github.com/KsaifStack.png"
                    alt="GitHub Profile"
                    className="github-avatar"
                />
                <div className="user-info">
                    <div className="github-username">KsaifStack</div>
                </div>
            </div>

            {showDropdown && (
                <div
                    className="dropdown-container"
                >
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
