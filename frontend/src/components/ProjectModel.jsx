

class ProjectModel {
    constructor(project, onClose, onUpdateWorkflow) {
        this.project = project;
        this.onClose = onClose;
        this.onUpdateWorkflow = onUpdateWorkflow;
    }

    openWorkflow() {
    console.log("Open workflow for:", this.project);
    // TODO:
    // - Electron: ipcRenderer.send("open-workflow", this.project.path)
}

openInFileManager() {
    console.log("Open in file manager:", this.project.path);
    // TODO:
    // - Electron: shell.openPath(this.project.path)
}

    async addWorkflowItem() {
        try {
            const newItemPath = await window.electronAPI.openExeDialog();
            if (!newItemPath) return;

            const toolInfo = await sendPathBackend(newItemPath);

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
                <div className="project-model" onClick={(e) => e.stopPropagation()}>
                   <div className="model-header">
    <div className="model-icon">{this.project.icon}</div>

    <div className="model-header-content">
        <h2 className="model-title">{this.project.title}</h2>
        <p className="model-subtitle">{this.project.subtitle}</p>

        <div className="header-action-buttons">
            <button
                className="primary-action-btn"
                onClick={() => this.openWorkflow()}
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

    <button className="close-button" onClick={this.onClose}>×</button>
</div>


                    <div className="model-content">
                        <div className="model-section">
                            <h3>Tech Stack</h3>
                            <div className="tags">
                                {this.project.techStack.map((tech, idx) => (
                                    <span key={idx} className="tag">{tech}</span>
                                ))}
                            </div>
                        </div>

                        <div className="model-section">
                            <h3>Workflow</h3>
                            <div className="workflow-list">
                                {this.project.workflow.map((tool, idx) => (
                                    <div key={idx} className="workflow-item">
                                        <span>{tool.name}</span>
                                        <span>{tool.path}</span>
                                        <button 
                                            className="remove-btn"
                                            onClick={() => this.removeWorkflowItem(idx)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
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
                        
                        <div className = "model-section">
                            <h3>Project Configuration </h3>
                            <p className="text">Project Main Directory</p>
                            <div className="Directory-section">
                             <button className = "path-button">...</button>
                            <p className="path-text">{this.project.path}</p>
                            </div> 
                            
                        </div>

                        
                        

                        <div className="model-stats">
                            <div className="stat-item">
                                <div className="stat-label">Total Commits</div>
                                <div className="stat-value">  {this.project.commits}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Daily Commits</div>
                                <div className="stat-value">{this.project.dailyCommits}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Last Opened</div>
                                <div className="stat-value">{this.project.date.replace('Last Opened: ', '>')}</div>
                                
                            </div>
                        </div>

                         <div className="model-section">
                            <h3>Insights (AI)</h3>
                            <p className="insights-text">{this.project.insights}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function ProjectModelComponent({ project, onClose, onUpdateWorkflow }) {
    const model = new ProjectModel(project, onClose, onUpdateWorkflow);
    return model.render();
}

async function sendPathBackend(path) {
    const response = await fetch(
        "http://127.0.0.1:5180/api/projdirectory/send", // backend port
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path })
        }
    );

    if (!response.ok) {
        throw new Error("Backend request failed");
    }

    return await response.json();
}






export default ProjectModelComponent;