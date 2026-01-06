import { useState } from 'react';
import TitleBar from './components/TitleBar.jsx';
import ProjectModelComponent from './components/ProjectModel.jsx';
import AddProjectModelComponent from './components/AddProjectModel.jsx';
import darkPin from './assets/images/darkPin.png';
import darkAdd from './assets/images/darkAdd.png';
import darkTrash from './assets/images/darkTrash.png'

function App() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [showAddModel, setShowAddModel] = useState(false);
    const [projects, setProjects] = useState([
        {
            id: 1,
            icon: '🎮',
            iconClass: 'godot-icon',
            ProjectType: 'Local Project',
            title: 'The Amazing Gorgonzola',
            subtitle: 'RPG Adventure',
            date: 'Last Opened: Over 5 days ago',
            status: ' Your at a good pace keep up the good work!',
            isPinned: false,
            workflow: ['VS Code', 'Godot Engine'],
            path: '/Users/projects/gorgonzola',
            commits: 47,
            dailyCommits: 3,
            techStack: ['GDScript', 'Godot'],
            goals: ['Complete level 3', 'Add sound effects', 'Test multiplayer'],
            insights: 'Consistent progress with regular commits. Focus on completing level 3 this week.'
        },
        {
            id: 2,
            icon: '⚠️',
            iconClass: 'warning-icon-emoji',
            ProjectType: 'Local Project',
            title: 'CodingAssignment3.cpp',
            subtitle: 'Portfolio Site',
            date: 'Last Opened: Dec 15, 2024',
            status: 'You have been commiting a lot overnight consider taking a break!',
            isPinned: true,
            workflow: ['VS Code'],
            path: '/Users/projects/assignment3',
            commits: 23,
            dailyCommits: 8,
            techStack: ['C++'],
            goals: ['Finish algorithm implementation', 'Add documentation'],
            insights: 'High overnight activity detected. Consider taking breaks to avoid burnout.'
        },
        {
            id: 3,
            icon: '💀',
            iconClass: 'skull',
            ProjectType: 'Local Project',
            title: 'Christmas_Video_Project',
            subtitle: 'Mobile App Prototype',
            date: 'Last Opened: Nov 2, 2024',
            status: 'You\'ve stopped working on this project for a while, maybe pick it up when you\'ve got a moment.',
            isPinned: false,
            workflow: ['DaVinci Resolve'],
            path: '/Users/projects/christmas-video',
            commits: 8,
            dailyCommits: 0,
            techStack: ['Video Editing'],
            goals: ['Render final cut', 'Add music'],
            insights: 'Project inactive for over 60 days. Consider scheduling time to complete remaining tasks.'
        },
    ]);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };

    const closeModel = () => {
        setSelectedProject(null);
    };

    const openAddModel = () => {
        setShowAddModel(true);
    };

    const closeAddModel = () => {
        setShowAddModel(false);
    };

    const addProject = (newProject) => {
        setProjects([...projects, newProject]);
    };

    const updateWorkflow = (projectId, newWorkflow) => {
        setProjects(projects.map(p => 
            p.id === projectId ? { ...p, workflow: newWorkflow } : p
        ));
        if (selectedProject && selectedProject.id === projectId) {
            setSelectedProject({ ...selectedProject, workflow: newWorkflow });
        }
    };

    const mostRecentProject = projects[0];
    
    const openProjectById = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);
        }
    };

    return (
        <div className="app">
            <TitleBar />
            <div className="main-content">
                <div className="left-panel ">
                    <div className="greeting">Hey, <span className="username">[USER]</span> </div>
                    <p className="Mess">
                        It's been a while since you've touched your <strong>CodingAssignment3.cpp</strong>,
                        why don't we have a crack at it today?
                    </p>
                    <button className="bigbutton" onClick={() => setSelectedProject(mostRecentProject)}>
                        Open <br /> {mostRecentProject.title}
                    </button>
                </div>
                <div className="right-panel">
                    <div className="toolbar">
                        <div className="button-container">
                            <button className="Addbutton" onClick={openAddModel}>
                                <img id="buttonImage" src={darkAdd} />
                            </button>
                        </div>
                        <button className="sort-button">
                            Sort by: Name (A-Z) <span className="arrosw">▼</span>
                        </button>
                    </div>

                    <div className="project-info">
                        <div className="project-list">
                            {projects.map(project => (
                                <div 
                                    key={project.id} 
                                    className="project-card"
                                    onClick={() => handleProjectClick(project)}
                                >
                                    <div className={`project-icon ${project.iconClass}`}>
                                        {project.icon}
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
                />
            )}
            {showAddModel && (
                <AddProjectModelComponent 
                    onClose={closeAddModel}
                    onAddProject={addProject}
                />
            )}
        </div>
    )
}

export default App;