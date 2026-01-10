import { useState } from 'react';
import dummyIcon from '../assets/images/defaultProj.png';
import darkPin from '../assets/images/darkPin.png';
import darkTrash from '../assets/images/darkTrash.png';

function ProjectModelComponent({
    project,
    onClose,
    onUpdateWorkflow,
    onUpdatePath,
    onUpdateTitle,
    onUpdateIcon,
}) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [titleInput, setTitleInput] = useState(project.title);

    const toggleConfig = () => setIsConfigOpen(!isConfigOpen);

    // ✅ Unified save function
    const saveProject = async (updatedProject) => {
        try {
            await window.electronAPI.exportProject({
                ...updatedProject,
                workflow: updatedProject.workflow.map(w => ({ name: w.name, path: w.path })),
            });
            console.log('Project saved:', updatedProject.title);
        } catch (err) {
            console.error('Failed to save project:', err);
        }
    };

    const handleTitleChange = async () => {
        if (titleInput.trim() === '' || titleInput === project.title) return;

        // Update parent state
        onUpdateTitle(project.id, titleInput);

        // Save immediately
        await saveProject({ ...project, title: titleInput });
    };

    const changeProjectIcon = async () => {
        const iconPath = await window.electronAPI.openImageDialog();
        if (!iconPath) return;

        onUpdateIcon(project.id, iconPath);
        await saveProject({ ...project, icon: iconPath });
    };

    const changeFilePath = async () => {
        const path = await window.electronAPI.openDirectoryDialog();
        if (!path) return;

        onUpdatePath(project.id, path);
        await saveProject({ ...project, path });
    };

    const addWorkflowItem = async () => {
        try {
            const newItemPath = await window.electronAPI.openExeDialog();
            if (!newItemPath) return;

            const toolInfo = await window.electronAPI.sendPathToBackend(newItemPath);
            const newWorkflow = [...project.workflow, toolInfo];

            onUpdateWorkflow(project.id, newWorkflow);
            await saveProject({ ...project, workflow: newWorkflow });
        } catch (err) {
            console.error('Failed to add workflow item:', err);
        }
    };

    const removeWorkflowItem = async (index) => {
        const newWorkflow = project.workflow.filter((_, i) => i !== index);
        onUpdateWorkflow(project.id, newWorkflow);
        await saveProject({ ...project, workflow: newWorkflow });
    };

    const openWorkFlow = async () => {
        try {
            for (const tool of project.workflow) {
                try {
                    await window.electronAPI.openTool(tool.path);
                } catch {
                    console.warn('Failed to open tool:', tool.path);
                }
            }

            await saveProject(project);
        } catch (err) {
            console.error('OpenWorkFlow failed:', err);
        }
    };

    const openInFileManager = async () => {
        await window.electronAPI.openProjDirectory(project.path);
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="project-model" onClick={(e) => e.stopPropagation()}>
                <div className="button-container">
                    <button className="Trashbutton">
                        <img id="probuttonImage" src={darkTrash} />
                    </button>
                    <button className="Pinbutton">
                        <img id="probuttonImage" src={darkPin} />
                    </button>
                </div>

                <button className="close-button" onClick={onClose}>×</button>

                <div className="model-header">
                    <div className="model-icon">
                        <img src={project.icon || dummyIcon} alt="Project icon" />
                    </div>
                    <div className="model-header-content">
                        <h2 className="model-title">{project.title}</h2>
                        <p className="model-subtitle">{project.subtitle}</p>

                        <div className="header-action-buttons">
                            <button className="primary-action-btn" onClick={openWorkFlow}>
                                Open WorkFlow
                            </button>
                            <button className="secondary-action-btn" onClick={openInFileManager}>
                                Open in File Manager
                            </button>
                        </div>
                    </div>
                </div>

                <div className="model-content">
                    <div className="model-section">
                        <h3>Tech Stack</h3>
                        <div className="tags">
                            {project.techStack.map((tech, idx) => (
                                <span key={idx} className="tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    <div className="model-section">
                        <h3>WorkFlow</h3>
                        <div className="workflow-list">
                            {project.workflow.map((tool, idx) => (
                                <div key={idx} className="workflow-item">
                                    <div className="workflow-icon">
                                        <img src={tool.icon || dummyIcon} alt={tool.name} />
                                    </div>
                                    <div className="workflow-info">
                                        <div className="workflow-header">
                                            <span className="workflow-name">{tool.name}</span>
                                            <button className="remove-btn" onClick={() => removeWorkflowItem(idx)}>×</button>
                                        </div>
                                        <span className="workflow-path">{tool.path}</span>
                                    </div>
                                </div>
                            ))}
                            {project.workflow.length === 0 && (
                                <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>
                                    No WorkFlow tools added yet!
                                </p>
                            )}
                            <button className="add-workflow-btn" onClick={addWorkflowItem}>
                                + Add Tool
                            </button>
                        </div>
                    </div>

                    <div className="model-section">
                        <button className="dropdown-header" onClick={() => setIsConfigOpen(!isConfigOpen)}>
                            <span>Project Configuration</span>
                            <span className={`dropdown-arrow ${isConfigOpen ? 'open' : ''}`}>▾</span>
                        </button>

                        {isConfigOpen && (
                            <div className="dropdown-container">
                                <div className="dropdown-option">
                                    <p className="text">Change Project Title</p>
                                    <input
                                        type="text"
                                        value={titleInput}
                                        onChange={(e) => setTitleInput(e.target.value)}
                                        className="title-input"
                                    />
                                    <button className="done-btn" onClick={handleTitleChange}>Done</button>
                                </div>

                                <div className="dropdown-option">
                                    <p className="text">Change Project img</p>
                                    <div
                                        className="icon-wrapper"
                                        style={{ cursor: 'pointer', display: 'inline-block' }}
                                        title="Click to open in file explorer"
                                        onClick={(e) => { e.stopPropagation(); changeProjectIcon(); }}
                                    >
                                        <img src={project.icon || dummyIcon} alt="Project Icon" className="current-icon"
                                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ccc' }}
                                        />
                                    </div>
                                </div>

                                <div className="dropdown-option">
                                    <p className="text">Project Main Directory</p>
                                    <div className="Directory-section">
                                        <button className="path-button" onClick={changeFilePath}>...</button>
                                        <p className="path-text">{project.path}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="model-section">
                        <h3>Insights (AI)</h3>
                        <p className="insights-text">{project.insights}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectModelComponent;
