import { useState, useEffect, useRef } from 'react';
import '../App.css';


const getGitHubUser = async () => {
    //TODO: 
    // Gets/pulls github user to check and verfiy github repo information
    //Remove if AddProject/ProjectModel can access this information
    const user ="IamBaka"
    console.log("hi user :",{user},"!")
};

const isValidGitHubUrl = (url) => {
    //TODO: 
    //checks if its a vaild github link(just remove this if you already done it/handled it)
    console.log("This github link is vaild!")
};

const fetchGitHubRepo = async (url) => {
    //TODO:
    //Get githubRepo info and return it
    console.log("Return name ,desc ,tech stack ,url ,readme(for ai) , prev commit history")
}



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
        window.electronAPI.openTool('https://github.com/' + username);
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

export { 
    isValidGitHubUrl,
    fetchGitHubRepo, 
    getGitHubUser,      
};

export default GitHubProfile;