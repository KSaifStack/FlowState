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
    onDeleteProject,
    onPinProject,
}) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [titleInput, setTitleInput] = useState(project.title);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Unified save function
    const saveProject = async (updatedFields) => {
        try {
            const updated = { ...project, ...updatedFields };
            // Make sure workflow only contains serializable data
            await window.electronAPI.exportProject({
                ...updated,
                workflow: updated.workflow.map(w => ({
                    name: w.name,
                    path: w.path,
                    icon: w.icon || undefined,
                })),
            });
            console.log('Project saved successfully:', updated.title);
        } catch (err) {
            console.error('Failed to save project:', err);
        }
    };

    const handleTitleChange = async () => {
        const trimmed = titleInput.trim();
        if (!trimmed || trimmed === project.title) return;

        onUpdateTitle(project.id, trimmed);
        await saveProject({ title: trimmed });
    };

    const changeProjectIcon = async () => {
        try {
            const iconPath = await window.electronAPI.openImageDialog();
            if (!iconPath) return;

            onUpdateIcon(project.id, iconPath);
            await saveProject({ icon: iconPath });
        } catch (err) {
            console.error('Icon change failed:', err);
        }
    };

    const changeFilePath = async () => {
        try {
            const newPath = await window.electronAPI.openDirectoryDialog();
            if (!newPath) return;

            onUpdatePath(project.id, newPath);
            await saveProject({ path: newPath });
        } catch (err) {
            console.error('Path change failed:', err);
        }
    };

    const addWorkflowItem = async () => {
        try {
            const exePath = await window.electronAPI.openExeDialog();
            if (!exePath) return;

            const toolInfo = await window.electronAPI.sendPathToBackend(exePath);
            const newWorkflow = [...project.workflow, toolInfo];

            onUpdateWorkflow(project.id, newWorkflow);
            await saveProject({ workflow: newWorkflow });
        } catch (err) {
            console.error('Failed to add workflow item:', err);
        }
    };

    const removeWorkflowItem = async (index) => {
        const newWorkflow = project.workflow.filter((_, i) => i !== index);
        onUpdateWorkflow(project.id, newWorkflow);
        await saveProject({ workflow: newWorkflow });
    };

    const openWorkFlow = async () => {
        for (const tool of project.workflow) {
            try {
                await window.electronAPI.openTool(tool.path);
            } catch (err) {
                console.warn(`Failed to open tool: ${tool.path}`, err);
            }
        }
    };

    const openInFileManager = async () => {
        try {
            await window.electronAPI.openProjDirectory(project.path);
        } catch (err) {
            console.error('Failed to open project directory:', err);
        }
    };

    const handleDelete = async () => {
        if (!onDeleteProject) return;
        
        try {
            // Call backend to delete the project file
            const result = await window.electronAPI.deleteProject(project.id);
            
            if (result.success) {
                // Update state in parent component
                onDeleteProject(project.id);
                console.log('Project deleted successfully:', project.title);
                onClose();
            } else {
                throw new Error(result.error || 'Failed to delete project');
            }
        } catch (err) {
            console.error('Failed to delete project:', err);
            alert('Failed to delete project. Please try again.');
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handlePin = async () => {
        if (!onPinProject) return;
        
        try {
            const newPinnedState = !project.isPinned;
            
            // Call backend to pin/unpin the project
            const result = await window.electronAPI.pinProject(project.id, newPinnedState);
            
            if (result.success) {
                // Update state in parent component
                onPinProject(project.id);
                
                // Save the updated pin state
                await saveProject({ isPinned: newPinnedState });
                
                console.log(`Project ${newPinnedState ? 'pinned' : 'unpinned'}:`, project.title);
            } else {
                throw new Error(result.error || 'Failed to pin project');
            }
        } catch (err) {
            console.error('Failed to pin/unpin project:', err);
            alert('Failed to update pin status. Please try again.');
        }
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="project-model" onClick={(e) => e.stopPropagation()}>
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div 
                        className="overlay" 
                        style={{ zIndex: 1001 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <div 
                            className="delete-confirm-modal" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="delete-confirm-title">Delete Project?</h3>
                            <p className="delete-confirm-message">
                                Are you sure you want to delete "{project.title}"? This action cannot be undone.
                            </p>
                            <div className="Add-subbuttons">
                                <button 
                                    className="secondary-action-btn"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="delete-confirm-btn"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control buttons (delete + pin) */}
                <div className="button-container">
                    <button 
                        className="Trashbutton" 
                        onClick={handleDeleteClick} 
                        title="Delete project"
                    >
                        <img id="ProjectbuttonImage" src={darkTrash} alt="Delete" />
                    </button>
                    <button 
                        className={`Pinbutton ${project.isPinned ? 'pinned' : ''}`}
                        onClick={handlePin} 
                        title={project.isPinned ? "Unpin project" : "Pin project"}
                    >
                        <img id="ProjectbuttonImage" src={darkPin} alt="Pin" />
                    </button>
                </div>

                <button className="close-button" onClick={onClose}>×</button>

                <div className="model-header">
                    <div className="model-icon">
                        <img
                            src={project.icon || dummyIcon}
                            alt="Project icon"
                            className="model-icon-img"
                        />
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
                    {/* Tech Stack */}
                    <div className="model-section">
                        <h3>Tech Stack</h3>
                        <div className="tags">
                            {project.techStack?.map((tech, idx) => (
                                <span key={idx} className="tag">{tech}</span>
                            ))}
                        </div>
                    </div>

                    {/* Workflow */}
                    <div className="model-section">
                        <h3>WorkFlow</h3>
                        <div className="workflow-list">
                            {project.workflow?.map((tool, idx) => (
                                <div key={idx} className="workflow-item">
                                    <div className="workflow-icon">
                                        <img src={tool.icon || dummyIcon} alt={tool.name} />
                                    </div>
                                    <div className="workflow-info">
                                        <div className="workflow-header">
                                            <span className="workflow-name">{tool.name}</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeWorkflowItem(idx)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <span className="workflow-path">{tool.path}</span>
                                    </div>
                                </div>
                            ))}

                            {(!project.workflow || project.workflow.length === 0) && (
                                <p className="no-data-text">
                                    No WorkFlow tools added yet!
                                </p>
                            )}

                            <button className="add-workflow-btn" onClick={addWorkflowItem}>
                                + Add Tool
                            </button>
                        </div>
                    </div>

                    {/* Configuration dropdown */}
                    <div className="model-section">
                        <button
                            className="dropdown-header"
                            onClick={() => setIsConfigOpen(!isConfigOpen)}
                        >
                            <span>Project Configuration</span>
                            <span className={`dropdown-arrow ${isConfigOpen ? 'open' : ''}`}>▾</span>
                        </button>

                        {isConfigOpen && (
                            <div className="dropdown-container">
                                {/* Title */}
                                <div className="dropdown-option">
                                    <p className="text">Change Project Title</p>
                                    <input
                                        type="text"
                                        value={titleInput}
                                        onChange={(e) => setTitleInput(e.target.value)}
                                        className="title-input"
                                    />
                                    <button className="done-btn" onClick={handleTitleChange}>
                                        Done
                                    </button>
                                </div>

                                {/* Icon */}
                                <div className="dropdown-option">
                                    <p className="text">Change Project Icon</p>
                                    <div
                                        className="icon-wrapper"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            changeProjectIcon();
                                        }}
                                    >
                                        <img
                                            src={project.icon || dummyIcon}
                                            alt="Project Icon"
                                            className="current-icon"
                                        />
                                    </div>
                                </div>

                                {/* Directory */}
                                <div className="dropdown-option">
                                    <p className="text">Project Main Directory</p>
                                    <div className="Directory-section">
                                        <button className="path-button" onClick={changeFilePath}>
                                            ...
                                        </button>
                                        <p className="path-text">{project.path}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Insights & Stats */}
                    <div className="model-section">
                        <h3>Insights (AI)</h3>
                        <p className="insights-text">{project.insights || 'No insights yet'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectModelComponent;