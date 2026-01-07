import { useState, useEffect, useRef } from 'react';
import '../App.css';

function GitHubProfile() {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="github-profile" ref={dropdownRef} style={{ position: 'relative' }}>
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
                <div className="dropdown-container" style={{ position: 'absolute', top: '110%', right: 0 }}>
                    <div className="gitdropdown-option" onClick={() => console.log('View Profile')}>
                        <span className="option-label">View Profile</span>
                    </div>
                    <div className="gitdropdown-option" onClick={() => console.log('Sign Out')}>
                        <span className="option-label">Sign Out</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GitHubProfile;
