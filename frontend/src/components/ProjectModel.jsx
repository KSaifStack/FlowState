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
    onDeleteProject,    // ← added (recommended)
    onPinProject,       // ← added (recommended)
}) {
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [titleInput, setTitleInput] = useState(project.title);

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
        // Optional: save last opened timestamp etc.
    };

    const openInFileManager = async () => {
        try {
            await window.electronAPI.openProjDirectory(project.path);
        } catch (err) {
            console.error('Failed to open project directory:', err);
        }
    };

    const handleDelete = () => {
        if (!onDeleteProject) return;
        onDeleteProject(project.id);
        onClose();
    };

    const handlePin = () => {
        if (!onPinProject) return;
        onPinProject(project.id);
        // Optional: could close or give feedback
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="project-model" onClick={(e) => e.stopPropagation()}>
                {/* Control buttons (delete + pin) */}
                <div className="button-container">
                    <button className="Trashbutton" onClick={handleDelete} title="Delete project">
                        <img id="ProjectbuttonImage" src={darkTrash} alt="Delete" />
                    </button>
                    <button className="Pinbutton" onClick={handlePin} title="Pin project">
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
                                <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>
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
                                        style={{ cursor: 'pointer', display: 'inline-block' }}
                                        title="Click to change icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            changeProjectIcon();
                                        }}
                                    >
                                        <img
                                            src={project.icon || dummyIcon}
                                            alt="Project Icon"
                                            className="current-icon"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '8px',
                                                objectFit: 'cover',
                                                border: '1px solid #ccc',
                                            }}
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

                    {/* Optional: stats section */}
                    {/* Uncomment if you want to keep it */}
                    {/* 
          <div className="model-stats">
            <div className="stat-item">
              <div className="stat-label">Total Commits</div>
              <div className="stat-value">{project.commits ?? '-'}</div>
            </div>
            ...
          </div>
          */}
                </div>
            </div>
        </div>
    );
}

export default ProjectModelComponent;