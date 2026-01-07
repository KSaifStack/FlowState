import { useState } from 'react';
import dummyIcon from '../assets/images/defaultProj.png';
import App from "../App.jsx";

class ProjectModel {
    constructor(
        project,
        onClose,
        onUpdateWorkflow,
        onUpdatePath,
        onUpdateTitle,
        onUpdateIcon,
        isConfigOpen,
        toggleConfig,
        titleInput,
        setTitleInput,
        handleTitleChange
    ) {
        this.project = project;
        this.onClose = onClose;
        this.onUpdateWorkflow = onUpdateWorkflow;
        this.onUpdatePath = onUpdatePath;
        this.onUpdateTitle = onUpdateTitle;
        this.onUpdateIcon = onUpdateIcon;
        this.isConfigOpen = isConfigOpen;
        this.toggleConfig = toggleConfig;

        this.titleInput = titleInput;
        this.setTitleInput = setTitleInput;
        this.handleTitleChange = handleTitleChange;
    }

    openWorkFlow() {
        console.log("Open workflow for:", this.project);

        for (let i = 0; i < this.project.workflow.length; i++) {
            window.electronAPI.openTool(this.project.workflow[i].path);
        }

    }

    async openInFileManager() {
        console.log("Open in file manager:", this.project.path);

        await window.electronAPI.openProjDirectory(this.project.path);
    }

    async changeFilePath() {
        console.log("Open in file manager to change path:", this.project.path);
        // TODO:
        // - Electron: implement file/folder selection dialog
        const path = await window.electronAPI.openDirectoryDialog();
        if (!path) return;

        this.onUpdatePath(this.project.id, path);
        // set current project path to path

        console.log("Selected folder:", path);
    }

   

    changeProjectIcon(newImg){
        console.log("Changed project icon.")
        //TODO:
        // - Update current project picture to new picture

        this.onUpdateIcon(this.project.id, iconPath);
    }

    async addWorkflowItem() {
        try {
            const newItemPath = await window.electronAPI.openExeDialog();
            if (!newItemPath) return;

            const toolInfo = await window.electronAPI.sendPathToBackend(newItemPath);
            const newWorkflow = [...this.project.workflow, toolInfo];
            this.onUpdateWorkflow(this.project.id, newWorkflow);
        } catch (err) {
            console.error("Failed to add workflow item:", err);
        }
    }

    removeWorkflowItem(index) {
        const newWorkflow = this.project.workflow.filter((_, i) => i !== index);
        this.onUpdateWorkflow(this.project.id, newWorkflow);
    }

    render() {
        return (
            <div className="overlay" onClick={this.onClose}>
                <div
                    className="project-model"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="close-button"
                        onClick={this.onClose}
                    >
                        ×
                    </button>

                    <div className="model-header">
                        <div className="model-icon">
                            <img
                                src={this.project.icon || dummyIcon}
                                alt="Project icon"
                                className="model-icon-img"
                            />
                        </div>

                        <div className="model-header-content">
                            <h2 className="model-title">{this.project.title}</h2>
                            <p className="model-subtitle">{this.project.subtitle}</p>

                            <div className="header-action-buttons">
                                <button
                                    className="primary-action-btn"
                                    onClick={() => this.openWorkFlow()}
                                >
                                    Open Workflow
                                </button>

                                <button
                                    className="secondary-action-btn"
                                    onClick={() => this.openInFileManager()}
                                >
                                    Open in File Manager
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="model-content">
                        <div className="model-section">
                            <h3>Tech Stack</h3>
                            <div className="tags">
                                {this.project.techStack.map((tech, idx) => (
                                    <span key={idx} className="tag">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="model-section">
                            <h3>WorkFlow</h3>
                            <div className="workflow-list">
                                {this.project.workflow.map((tool, idx) => (
                                    <div key={idx} className="workflow-item">
                                        <div className="workflow-icon">
                                            <img
                                                src={tool.icon || dummyIcon}
                                                alt={tool.name}
                                            />
                                        </div>

                                        <div className="workflow-info">
                                            <div className="workflow-header">
                                                <span className="workflow-name">{tool.name}</span>
                                                <button
                                                    className="remove-btn"
                                                    onClick={() => this.removeWorkflowItem(idx)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <span className="workflow-path">{tool.path}</span>
                                        </div>
                                    </div>
                                ))}

                                {this.project.workflow.length === 0 && (
                                    <p
                                        style={{
                                            color: '#888',
                                            fontSize: '14px',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No WorkFlow tools added yet!
                                    </p>
                                )}

                                <button
                                    className="add-workflow-btn"
                                    onClick={() => this.addWorkflowItem()}
                                >
                                    + Add Tool
                                </button>
                            </div>
                        </div>

                        <div className="model-section">
                            <h3>Goals (AI)</h3>
                            <ul className="goals-list">
                                {this.project.goals.map((goal, idx) => (
                                    <li key={idx}>{goal}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="model-section">
                            <button
                                className="dropdown-header"
                                onClick={this.toggleConfig}
                            >
                                <span>Project Configuration</span>
                                <span className={`dropdown-arrow ${this.isConfigOpen ? 'open' : ''}`}>
                                    ▾
                                </span>
                            </button>
                            {this.isConfigOpen && (
                                <div className="dropdown-container">
                                    <div className ="dropdown-option"> 
                                        <p className="text">Change Project Title</p>
                                        <input 
                                            type="text"
                                            value={this.titleInput}
                                            onChange={(e) => this.setTitleInput(e.target.value)}
                                            className="title-input"
                                        />
                                        <button className="done-btn" onClick={this.handleTitleChange}>Done</button>
                                    </div>
                                    <div className="dropdown-option" onClick ={()=>this.changeProjectIcon()}> 
                                        <p className="text">Change Project img</p>
                                    <div
                                    className="icon-wrapper"
                                    style={{cursor: 'pointer',display: 'inline-block'}}
                                    title="Click to change"
                                    onClick={async () => {
                                        const iconPath = await window.electronAPI.openFileDialog();
                                        if (iconPath) this.changeProjectIcon(iconPath);
                                    }}
                                    >
                                        <img
                                        src={this.project.icon ||dummyIcon}
                                        alt="Project Icon"
                                        className = "current-icon"
                                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ccc' }}
                                        />
                                        </div>
                                    </div>
                                    
                                    <div className="dropdown-option">
                                        <p className="text">Project Main Directory</p>
                                        <div className="Directory-section">
                                            <button
                                                className="path-button"
                                                onClick={() => this.changeFilePath()}
                                            >
                                                ...
                                            </button>
                                            <p className="path-text">{this.project.path}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="model-section">
                            <h3>Insights (AI)</h3>
                            <p className="insights-text">{this.project.insights}</p>
                        </div>
                        <div className="model-stats">
                            <div className="stat-item">
                                <div className="stat-label">Total Commits</div>
                                <div className="stat-value">{this.project.commits}</div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">Average Daily Commits</div>
                                <div className="stat-value">{this.project.dailyCommits}</div>
                            </div>

                            <div className="stat-item">
                                <div className="stat-label">Last Opened</div>
                                <div className="stat-value">
                                    {this.project.date.replace("Last Opened: ", ">")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function ProjectModelComponent({ project, onClose, onUpdateWorkflow, onUpdatePath, onUpdateTitle, onUpdateIcon }) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [titleInput, setTitleInput] = useState(project.title);

    const toggleConfig = () => setIsConfigOpen(!isConfigOpen);

    const handleTitleChange = () => {
        if (titleInput.trim() === '' || titleInput === project.title) return;
        onUpdateTitle(project.id, titleInput);
        console.log("Title has been updated to: ",titleInput)
    };

    const handleIconChange = async () => {
        const iconPath = await window.electronAPI.openImageDialog();
        if (!iconPath) return;
        onUpdateIcon(project.id, iconPath);
};


    const model = new ProjectModel(
        project,
        onClose,
        onUpdateWorkflow,
        onUpdatePath,
        onUpdateTitle,
        onUpdateIcon,
        isConfigOpen,
        toggleConfig,
        titleInput,
        setTitleInput,
        handleTitleChange
    );

    return model.render();
}

export default ProjectModelComponent;
