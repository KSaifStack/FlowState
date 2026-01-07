import { useState } from 'react';
import TitleBar from './components/TitleBar.jsx';
import ProjectModelComponent from './components/ProjectModel.jsx';
import AddProjectModelComponent from './components/AddProjectModel.jsx';
import darkPin from './assets/images/darkPin.png';
import darkAdd from './assets/images/darkAdd.png';
import darkTrash from './assets/images/darkTrash.png';
import dummyIcon from './assets/images/defaultProj.png';

function App() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModel, setShowAddModel] = useState(false);
    const [sortBy, setSortBy] = useState('Name (A-Z)');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    const [projects, setProjects] = useState([
        {
            id: 1,
            icon: dummyIcon,
            iconClass: 'godot-icon',
            ProjectType: 'Local Project',
            title: 'The Amazing Gorgonzola',
            subtitle: 'RPG Adventure',
            date: 'Last Opened: 5 days ago',
            status: 'You\'re at a good pace, keep up the good work!',
            isPinned: false,
            workflow: [
                { name: 'VS Code', path: 'C:\\Applications\\VSCode.exe' },
                { name: 'Godot Engine', path: 'C:\\Applications\\Godot.exe' }
            ],
            path: 'C:\\Users\\projects\\gorgonzola',
            commits: 47,
            dailyCommits: 3,
            techStack: ['GDScript', 'Godot'],
            goals: ['Complete level 3', 'Add sound effects', 'Test multiplayer'],
            insights: 'Consistent progress with regular commits. Focus on completing level 3 this week.',
            lastOpenedDays: 5
        },
        {
            id: 2,
            icon: dummyIcon,
            iconClass: 'warning-icon-emoji',
            ProjectType: 'Local Project',
            title: 'CodingAssignment3.cpp',
            subtitle: 'Portfolio Site',
            date: 'Last Opened: 18 days ago',
            status: 'You\'ve been committing a lot overnight, consider taking a break!',
            isPinned: true,
            workflow: [{ name: 'VS Code', path: 'C:\\Applications\\Code.exe' }],
            path: 'C:\\Users\\projects\\assignment3',
            commits: 23,
            dailyCommits: 8,
            techStack: ['C++'],
            goals: ['Finish algorithm implementation', 'Add documentation'],
            insights: 'High overnight activity detected. Consider taking breaks to avoid burnout.',
            lastOpenedDays: 18
        },
        {
            id: 3,
            icon: dummyIcon,
            iconClass: 'skull',
            ProjectType: 'Local Project',
            title: 'Christmas_Video_Project',
            subtitle: 'Mobile App Prototype',
            date: 'Last Opened: Over 2 months',
            status: 'You\'ve stopped working on this project for a while, maybe pick it up when you\'ve got a moment.',
            isPinned: false,
            workflow: [{ name: 'DaVinci Resolve', path: 'C:\\Applications\\DaVinciResolve.exe' }],
            path: 'C:\\Users\\projects\\christmas-video',
            commits: 8,
            dailyCommits: 0,
            techStack: ['Video Editing'],
            goals: ['Render final cut', 'Add music'],
            insights: 'Project inactive for over 60 days. Consider scheduling time to complete remaining tasks.',
            lastOpenedDays: 60
        }
    ]);

    const handleProjectClick = (project) => setSelectedProject(project);
    const closeModel = () => setSelectedProject(null);
    const openAddModel = () => setShowAddModel(true);
    const closeAddModel = () => setShowAddModel(false);
    const addProject = (newProject) => setProjects([...projects, newProject]);

    const updateWorkflow = (projectId, newWorkflow) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, workflow: newWorkflow } : p));
        if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, workflow: newWorkflow });
    };

    const updatePath = (projectId, newPath) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, path: newPath } : p));
        if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, path: newPath });
    };

    const updateTitle = (projectId, newTitle) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, title: newTitle } : p));
        if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, title: newTitle });
    };

    const updateIcon = (projectId, newIconPath) => {
        setProjects(projects.map(p => p.id === projectId ? { ...p, icon: newIconPath } : p));
        if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, icon: newIconPath });
    };

    // Sorting Handling 
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setShowSortDropdown(false);
    };

    const getSortedProjects = () => {
        const sorted = [...projects];
        switch(sortBy) {
            case 'Name (A-Z)': return sorted.sort((a,b) => a.title.localeCompare(b.title));
            case 'Name (Z-A)': return sorted.sort((a,b) => b.title.localeCompare(a.title));
            case 'Newest': return sorted.sort((a,b) => a.lastOpenedDays - b.lastOpenedDays);
            case 'Oldest': return sorted.sort((a,b) => b.lastOpenedDays - a.lastOpenedDays);
            default: return sorted;
        }
    };
    const sortedProjects = getSortedProjects();
    const mostRecentProject = projects[0];

    return (
        <div className="app">
            <TitleBar />
            <div className="main-content">
                <div className="left-panel">
                    <div className="greeting">Hey, <span className="username">[USER]</span></div>
                    <p className="Mess">
                        It's been a while since you've touched <strong>{mostRecentProject.title}</strong>,
                        why don't we have a crack at it today?
                    </p>
                    <button className="bigbutton" onClick={() => setSelectedProject(mostRecentProject)}>
                        Open <br /> {mostRecentProject.title}
                    </button>
                </div>

                <div className="right-panel">
<div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div className="button-container">
        <button className="Addbutton" onClick={openAddModel}>
            <img id="buttonImage" src={darkAdd} />
        </button>
    </div>

    <div style={{ position: 'relative' }}>
        <button className="sort-button" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            Sort by: {sortBy} <span className="arrosw">▼</span>
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
                                        <img src={project.icon} alt="Project icon" />
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
