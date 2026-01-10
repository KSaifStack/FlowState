import { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar.jsx';
import ProjectModelComponent from './components/ProjectModel.jsx';
import AddProjectModelComponent from './components/AddProjectModel.jsx';
import darkPin from './assets/images/darkPin.png';
import darkAdd from './assets/images/darkAdd.png';
import darkTrash from './assets/images/darkTrash.png';
import dummyIcon from './assets/images/defaultProj.png';

function App() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModel, setShowAddModel] = useState(false);
    const [sortBy, setSortBy] = useState('Name (A-Z)');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Load real projects from backend
    useEffect(() => {
        async function loadProjects() {
            try {
                const filePaths = await window.electronAPI.loadAllProjects();
                const loadedProjects = [];

                for (const filePath of filePaths) {
                    const data = await window.electronAPI.importProject(filePath);
                    const project = data.projectPayload || data.ProjectPayload;

                    // Normalize property names for React
                    loadedProjects.push({
                        id: project.Id ?? project.id,
                        icon: project.IconClass || project.icon || dummyIcon,
                        ProjectType: project.ProjectType || project.projectType,
                        title: project.Title || project.title,
                        subtitle: project.Subtitle || project.subtitle,
                        date: project.Date || project.date,
                        status: project.Status || project.status,
                        isPinned: project.IsPinned ?? project.isPinned ?? false,
                        workflow: project.WorkFlow || project.workflow || [],
                        path: project.Path || project.path,
                        commits: project.Commits ?? project.commits ?? 0,
                        dailyCommits: project.DailyCommits ?? project.dailyCommits ?? 0,
                        techStack: project.TechStack || project.techStack || [],
                        goals: project.Goals || project.goals || [],
                        insights: project.Insights || project.insights,
                        lastOpenedDays: project.LastOpenedDays ?? project.lastOpenedDays ?? 0
                    });
                }

                setProjects(loadedProjects);
            } catch (err) {
                console.error("Failed to load projects:", err);
            }
        }

        loadProjects();
    }, []);


    // Project handlers
    const handleProjectClick = (project) => setSelectedProject(project);
    const closeModel = () => setSelectedProject(null);
    const openAddModel = () => setShowAddModel(true);
    const closeAddModel = () => setShowAddModel(false);
    const addProject = (newProject) => setProjects(prev => [...prev, newProject]);

    const updateWorkflow = (projectId, newWorkflow) => {
        setProjects(prev =>
            prev.map(p => p.id === projectId ? { ...p, workflow: newWorkflow } : p)
        );
        if (selectedProject?.id === projectId)
            setSelectedProject({ ...selectedProject, workflow: newWorkflow });
    };

    const updatePath = (projectId, newPath) => {
        setProjects(prev =>
            prev.map(p => p.id === projectId ? { ...p, path: newPath } : p)
        );
        if (selectedProject?.id === projectId)
            setSelectedProject({ ...selectedProject, path: newPath });
    };

    const updateTitle = (projectId, newTitle) => {
        setProjects(prev =>
            prev.map(p => p.id === projectId ? { ...p, title: newTitle } : p)
        );
        if (selectedProject?.id === projectId)
            setSelectedProject({ ...selectedProject, title: newTitle });
    };

    const updateIcon = (projectId, newIconPath) => {
        setProjects(prev =>
            prev.map(p => p.id === projectId ? { ...p, icon: newIconPath } : p)
        );
        if (selectedProject?.id === projectId)
            setSelectedProject({ ...selectedProject, icon: newIconPath });
    };

    // Sorting
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setShowSortDropdown(false);
    };

    const getSortedProjects = () => {
        const sorted = [...projects];
        switch (sortBy) {
            case 'Name (A-Z)': return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'Name (Z-A)': return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'Newest': return sorted.sort((a, b) => a.lastOpenedDays - b.lastOpenedDays);
            case 'Oldest': return sorted.sort((a, b) => b.lastOpenedDays - a.lastOpenedDays);
            default: return sorted;
        }
    };

    const sortedProjects = getSortedProjects();
    const mostRecentProject = sortedProjects[0];

    return (
        <div className="app">
            <TitleBar />

            <div className="main-content">
                {/* LEFT PANEL */}
                <div className="left-panel">
                    <div className="greeting">
                        Hey, <span className="username">[USER]</span>
                    </div>

                    {mostRecentProject ? (
                        <>
                            <p className="Mess">
                                It's been a while since you've touched{' '}
                                <strong>{mostRecentProject.title}</strong>, why don't we have a crack at it today?
                            </p>
                            <button
                                className="bigbutton"
                                onClick={() => setSelectedProject(mostRecentProject)}
                            >
                                Open <br /> {mostRecentProject.title}
                            </button>
                        </>
                    ) : (
                        <p className="Mess">
                            No projects found. Add one to get started 🚀
                        </p>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div className="right-panel">
                    <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="button-container">
                            <button className="Addbutton" onClick={openAddModel}>
                                <img id="buttonImage" src={darkAdd} />
                            </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button className="sort-button" onClick={() => setShowSortDropdown(!showSortDropdown)}>
                                Sort by: {sortBy} <span className="arrow">▼</span>
                            </button>
                            {showSortDropdown && (
                                <div className="sort-dropdown">
                                    {['Name (A-Z)', 'Name (Z-A)', 'Newest', 'Oldest'].map(option => (
                                        <div key={option} className="sort-option" onClick={() => handleSortChange(option)}>
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="project-info">
                        <div className="project-list">
                            {sortedProjects.map(project => (
                                <div key={project.id} className="project-card" onClick={() => handleProjectClick(project)}>
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedProject && (
                <ProjectModelComponent
                    project={selectedProject}
                    onClose={closeModel}
                    onUpdateWorkflow={updateWorkflow}
                    onUpdatePath={updatePath}
                    onUpdateTitle={updateTitle}
                    onUpdateIcon={updateIcon}
                />
            )}

            {showAddModel && (
                <AddProjectModelComponent onClose={closeAddModel} onAddProject={addProject} />
            )}
        </div>
    );
}

export default App;
