import { useState, useEffect, useRef } from 'react';
import '../App.css';


export const authenticateWithGitHub = async () => {
    console.log('authenticateWithGitHub()');
    return { username: 'KsaifStack', avatarUrl: 'https://github.com/KsaifStack.png' };
};


export const getGitHubUser = async () => {
    console.log('GetGitHubUser()');
    return { username: 'KsaifStack', avatarUrl: 'https://github.com/KsaifStack.png' };
};

export const signOutGitHub = async () => {
    console.log('SignOutGitHub()');
    return true;
};

export const fetchGitHubRepo = async (url) => {
    console.log('FetchGitHubRepository():', url);
    return null;
};


export const isValidGitHubUrl = (url) => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return pattern.test(url);
};



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
        console.log('View Profile clicked');
        closeDropdown();
    };

    const handleSignOut = () => {
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
                    className="gitdrop-container"
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