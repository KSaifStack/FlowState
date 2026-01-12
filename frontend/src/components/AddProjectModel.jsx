import {useState} from 'react'
import GithubIcon from '../assets/images/Github.png';
import { fetchGitHubRepo, isValidGitHubUrl } from '../components/GitHubProfile.jsx';
class AddProjectModel {
    constructor(onClose, onUpdateWorkflow, setImportType) {
        this.onClose = onClose;
        this.onUpdateWorkflow = onUpdateWorkflow;
        this.setImportType = setImportType;
    }

    async setLocal() {
        console.log("Opened Local Folder.")
        this.setImportType('local')
    }

    async setGithub(){
        console.log("Opened Github Import.")
        this.setImportType('github')
    }

    render() {
        return (
            <div className="overlay" onClick={this.onClose}>
                <div
                    className="project-model"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="model-header">
                        <h2 className="model-title">Add New Project</h2>
                        <button
                            className="close-button"
                            onClick={this.onClose}
                        >
                            ×
                        </button>
                    </div>

                    <div className="model-content">
                        <p className="model-subtitle">
                            Choose how you want to create your project.
                        </p>

                        <div className="action-buttons vertical">
                            <button
                                className="Github-button"
                                onClick={() => this.setGithub()}
                            >
                                <img src={GithubIcon} alt="Github" className="github-icon" />
                                <div className="Add-text">
                                    <span className="Add-title">Import from Github</span>
                                    <span className="Add-subtitle">
                                        Link your repository to FlowState! The AI will automatically read through your repository
                                        to track progress.
                                    </span>
                                </div>
                            </button>

                            <button
                                className="Local-button"
                                onClick={() => this.setLocal()}
                            >
                                <div className="Add-text">
                                    <span className="Add-title">Add from Local Folder</span>
                                    <span className="Add-subtitle">
                                        Select a directory and fill out your project description.  
                                        The AI will still auto-generate goals, ideas and suggestions.              
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function AddProjectModelComponent({ onClose, onUpdateWorkflow, onAddProject }) {
    const [ImportType, setImportType] = useState(null)
    const [githubUrl, setGithubUrl] = useState('')

    if (!ImportType) {
        const model = new AddProjectModel(onClose, onUpdateWorkflow, setImportType)
        return model.render()
    }

    if (ImportType === 'github') {
        const handleGitHubImport = async () => {
            console.log('Import button clicked for:', githubUrl);
            console.log('Valid URL?', isValidGitHubUrl(githubUrl));
            
            onClose();
        };

        return (
            <div className="overlay" onClick={onClose}>
                <div className="project-model" onClick={(e) => e.stopPropagation()}>
                    <div className="model-header">
                        <h2 className="model-title">Import from Repository</h2>
                    </div>
                    
                    <div className="model-content">
                        <div className="model-section">
                            <h3>Repository URL</h3>
                            <input
                                type="text"
                                className="title-input"
                                placeholder="https://github.com/username/repo"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                            />
                            <p className="gitmodel-subtitle">Note: Private repositories may require authentication</p>
                        </div>
                    </div>
                    
                    <div className="Add-subbuttons"> 
                        <button 
                            className="secondary-action-btn" 
                            onClick={() => setImportType(null)}
                        >
                            Back
                        </button> 
                        <button 
                            className="primary-action-btn" 
                            onClick={handleGitHubImport}
                            disabled={!githubUrl.trim()}
                        >
                            Import
                        </button>
                    </div>
                </div>
            </div> 
        );
    }

    if (ImportType === 'local') {
        const handleLocalImport = async () => {
            console.log('Select Folder clicked');
            onClose();
        };

        return (
            <div className="overlay" onClick={onClose}>
                <div className="project-model" onClick={(e) => e.stopPropagation()}>
                    <div className="model-header">
                        <h2 className="model-title">Open from Folder</h2>
                        <button className="close-button" onClick={onClose}>
                            ×
                        </button>
                    </div>
                    
                    <div className="model-content">
                        <p className="model-subtitle">Select a local folder to import as a project.</p>
                    </div>
                    
                    <div className="Add-subbuttons">
                        <button 
                            className="secondary-action-btn" 
                            onClick={() => setImportType(null)}
                        >
                            Back
                        </button>
                        <button 
                            className="primary-action-btn"
                            onClick={handleLocalImport}
                        >
                            Select Folder
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export default AddProjectModelComponent;