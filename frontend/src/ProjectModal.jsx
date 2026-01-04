class ProjectModal {
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

    addWorkflowItem() {
        const newItem = prompt('Enter workflow tool:');
        if (newItem && newItem.trim()) {
            const newWorkflow = [...this.project.workflow, newItem.trim()];
            this.onUpdateWorkflow(this.project.id, newWorkflow);
        }
    }

    removeWorkflowItem(index) {
        const newWorkflow = this.project.workflow.filter((_, i) => i !== index);
        this.onUpdateWorkflow(this.project.id, newWorkflow);
    }

    render() {
        return (
            <div className="overlay" onClick={this.onClose}>
                <div className="project-modal" onClick={(e) => e.stopPropagation()}>
                   <div className="modal-header">
    <div className="modal-icon">{this.project.icon}</div>

    <div className="modal-header-content">
        <h2 className="modal-title">{this.project.title}</h2>
        <p className="modal-subtitle">{this.project.subtitle}</p>

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


                    <div className="modal-content">
                        <div className="modal-section">
                            <h3>Tech Stack</h3>
                            <div className="tags">
                                {this.project.techStack.map((tech, idx) => (
                                    <span key={idx} className="tag">{tech}</span>
                                ))}
                            </div>
                        </div>

                        <div className="modal-section">
                            <h3>Workflow</h3>
                            <div className="workflow-list">
                                {this.project.workflow.map((tool, idx) => (
                                    <div key={idx} className="workflow-item">
                                        <span>{tool}</span>
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

                        <div className="modal-section">
                            <h3>Goals (AI)</h3>
                            <ul className="goals-list">
                                {this.project.goals.map((goal, idx) => (
                                    <li key={idx}>{goal}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="modal-section">
                            <h3>Insights (AI)</h3>
                            <p className="insights-text">{this.project.insights}</p>
                        </div>

                        <div className="modal-stats">
                            <div className="stat-item">
                                <div className="stat-value">{this.project.commits}</div>
                                <div className="stat-label">Total Commits</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{this.project.dailyCommits}</div>
                                <div className="stat-label">Daily Commits</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-value">{this.project.date.replace('Last Opened: ', '')}</div>
                                <div className="stat-label">Last Opened</div>
                            </div>
                        </div>

                        <div className="modal-section">
                            <p className="path-text">{this.project.path}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function ProjectModalComponent({ project, onClose, onUpdateWorkflow }) {
    const modal = new ProjectModal(project, onClose, onUpdateWorkflow);
    return modal.render();
}

export default ProjectModalComponent;