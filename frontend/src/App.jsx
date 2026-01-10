import { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar.jsx';
import ProjectModelComponent from './components/ProjectModel.jsx';
import AddProjectModelComponent from './components/AddProjectModel.jsx';
import darkAdd from './assets/images/darkAdd.png';
import dummyIcon from './assets/images/defaultProj.png';

function App({ onSignOut, authState }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModel, setShowAddModel] = useState(false);
    const [sortBy, setSortBy] = useState('Name (A-Z)');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Load projects from backend on mount
    useEffect(() => {
        async function loadProjects() {
            try {
                const filePaths = await window.electronAPI.loadAllProjects();
                const loadedProjects = [];

                for (const filePath of filePaths) {
                    const data = await window.electronAPI.importProject(filePath);
                    const payload = data.projectPayload || data.ProjectPayload || data;

                    loadedProjects.push({
                        id: payload.id ?? payload.Id ?? Date.now() + Math.random(),
                        icon: payload.icon ?? payload.IconClass ?? dummyIcon,
                        ProjectType: payload.ProjectType ?? payload.projectType ?? 'Local Project',
                        title: payload.title ?? payload.Title ?? 'Untitled Project',
                        subtitle: payload.subtitle ?? payload.Subtitle ?? '',
                        date: payload.date ?? payload.Date ?? 'Last Opened: Never',
                        status: payload.status ?? payload.Status ?? '',
                        isPinned: payload.isPinned ?? payload.IsPinned ?? false,
                        workflow: Array.isArray(payload.workflow ?? payload.WorkFlow)
                            ? payload.workflow ?? payload.WorkFlow
                            : [],
                        path: payload.path ?? payload.Path ?? '',
                        commits: Number(payload.commits ?? payload.Commits) || 0,
                        dailyCommits: Number(payload.dailyCommits ?? payload.DailyCommits) || 0,
                        techStack: Array.isArray(payload.techStack ?? payload.TechStack)
                            ? payload.techStack ?? payload.TechStack
                            : [],
                        goals: Array.isArray(payload.goals ?? payload.Goals)
                            ? payload.goals ?? payload.Goals
                            : [],
                        insights: payload.insights ?? payload.Insights ?? '',
                        lastOpenedDays: Number(payload.lastOpenedDays ?? payload.LastOpenedDays) || 999,
                    });
                }

                setProjects(loadedProjects);
            } catch (err) {
                console.error('Failed to load projects:', err);
            }
        }

        loadProjects();
    }, []);

    // Project modal handlers
    const handleProjectClick = (project) => setSelectedProject(project);
    const closeModel = () => setSelectedProject(null);
    const openAddModel = () => setShowAddModel(true);
    const closeAddModel = () => setShowAddModel(false);

    const addProject = (newProject) => {
        setProjects((prev) => [...prev, newProject]);
    };

    // Update handlers (sync both list and open modal)
    const createUpdater = (field) => (projectId, value) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, [field]: value } : p))
        );

        if (selectedProject?.id === projectId) {
            setSelectedProject((prev) => ({ ...prev, [field]: value }));
        }
    };

    const updateWorkflow = createUpdater('workflow');
    const updatePath = createUpdater('path');
    const updateTitle = createUpdater('title');
    const updateIcon = createUpdater('icon');

    // Sorting
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setShowSortDropdown(false);
    };

    const getSortedProjects = () => {
        const sorted = [...projects];
        switch (sortBy) {
            case 'Name (A-Z)':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'Name (Z-A)':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'Newest':
                return sorted.sort((a, b) => a.lastOpenedDays - b.lastOpenedDays);
            case 'Oldest':
                return sorted.sort((a, b) => b.lastOpenedDays - a.lastOpenedDays);
            default:
                return sorted;
        }
    };

    const sortedProjects = getSortedProjects();
    const mostRecentProject = sortedProjects[0] ?? null;

    return (
        <div className="app">
            <TitleBar authState={authState} onSignOut={onSignOut} />

            <div className="main-content">
                {/* LEFT PANEL - Suggestion / Greeting */}
                <div className="left-panel">
                    <div className="greeting">
                        Hey, <span className="username">[USER]</span>
                    </div>

                    {mostRecentProject ? (
                        <>
                            <p className="Mess">
                                It's been a while since you've touched{' '}
                                <strong>{mostRecentProject.title}</strong>,<br />
                                why don't we have a crack at it today?
                            </p>
                            <button
                                className="bigbutton"
                                onClick={() => setSelectedProject(mostRecentProject)}
                            >
                                Open<br />{mostRecentProject.title}
                            </button>
                        </>
                    ) : (
                        <p className="Mess">
                            No projects yet — add your first one to get started! 🚀
                        </p>
                    )}
                </div>

                {/* RIGHT PANEL - Project List */}
                <div className="right-panel">
                    <div className="toolbar">
                        <div className="button-container">
                            <button className="Addbutton" onClick={openAddModel} title="Add new project">
                                <img id="buttonImage" src={darkAdd} alt="Add" />
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                className="sort-button"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                            >
                                Sort by: {sortBy} <span className="arrow">▼</span>
                            </button>

                            {showSortDropdown && (
                                <div className="sort-dropdown">
                                    {['Name (A-Z)', 'Name (Z-A)', 'Newest', 'Oldest'].map((option) => (
                                        <div
                                            key={option}
                                            className="sort-option"
                                            onClick={() => handleSortChange(option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="project-info">
                        <div className="project-list">
                            {sortedProjects.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-text">
                                    <p>No projects loaded yet.</p>
                                    </div>
                                    <button className ="empty-button" onClick={openAddModel}>Create your first project</button>
                                </div>
                            ) : (
                                sortedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="project-card"
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        <div className="project-icon">
                                            <img src={project.icon || dummyIcon} alt="Project icon" />
                                        </div>
                                        <div className="project-info">
                                            <div className="project-title">{project.title}</div>
                                            <div className="project-type">{project.ProjectType}</div>
                                            <div className="project-subtitle">{project.subtitle}</div>
                                            <div className="project-date">{project.date}</div>
                                            <div className="project-status">{project.status}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedProject && (
                <ProjectModelComponent
                    project={selectedProject}
                    onClose={closeModel}
                    onUpdateWorkflow={updateWorkflow}
                    onUpdatePath={updatePath}
                    onUpdateTitle={updateTitle}
                    onUpdateIcon={updateIcon}
                // Bonus: pass these when you implement them in ProjectModel
                // onDeleteProject={handleDeleteProject}
                // onPinProject={handlePinProject}
                />
            )}

            {showAddModel && (
                <AddProjectModelComponent
                    onClose={closeAddModel}
                    onAddProject={addProject}
                />
            )}
        </div>
    );
}

export default App;