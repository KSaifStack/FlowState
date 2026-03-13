import { useState } from 'react';
import GithubIcon from '../assets/images/Github.png';
import defaultIcon from '../assets/images/defaultProj.png';
import { fetchGitHubRepo, isValidGitHubUrl } from '../components/GitHubProfile.jsx';


const readDirectory = async (path) => {
    try {
        return await window.electronAPI.readDirectory(path);
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
};


const readFile = async (filePath) => {
    try {
        return await window.electronAPI.readFile(filePath);
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
};


const findApplication = async (appName) => {
    try {
        return await window.electronAPI.findApplication(appName);
    } catch (error) {
        console.error('Error finding application:', error);
        return null;
    }
};


const getApplicationIcon = async (appPath) => {
    try {
        return await window.electronAPI.getApplicationIcon(appPath);
    } catch (error) {
        console.error('Error getting application icon:', error);
        return null;
    }
};


const cloneGitHubRepo = async (url, targetDir) => {
    try {
        return await window.electronAPI.cloneGitHubRepo(url, targetDir);
    } catch (error) {
        console.error('Error cloning GitHub repo:', error);
        throw error;
    }
};


const openDirectoryDialog = async () => {
    try {
        return await window.electronAPI.openDirectoryDialog();
    } catch (error) {
        console.error('Error opening directory dialog:', error);
        return null;
    }
};


const openImageDialog = async () => {
    try {
        return await window.electronAPI.openImageDialog();
    } catch (error) {
        console.error('Error opening image dialog:', error);
        return null;
    }
};


const exportProject = async (project) => {
    try {
        await window.electronAPI.exportProject(project);
    } catch (error) {
        console.error('Error exporting project:', error);
        throw error;
    }
};


class AddProjectModel {
    constructor(onClose, onUpdateWorkflow, setImportType) {
        this.onClose = onClose;
        this.onUpdateWorkflow = onUpdateWorkflow;
        this.setImportType = setImportType;
    }

    async setLocal() {
        console.log("Opened Local Folder.");
        this.setImportType('local');
    }

    async setGithub() {
        console.log("Opened Github Import.");
        this.setImportType('github');
    }

    render() {
        return (
            <div className="overlay" onClick={this.onClose}>
                <div className="project-model" onClick={(e) => e.stopPropagation()}>
                    <div className="model-header">
                        <h2 className="model-title">Add New Project</h2>
                    </div>

                    <div className="model-content">
                        <p className="model-subtitle">
                            Choose how you want to create your project.
                        </p>

                        <div className="action-buttons vertical">
                            <button className="Github-button" onClick={() => this.setGithub()}>
                                <img src={GithubIcon} alt="Github" className="github-icon" />
                                <div className="Add-text">
                                    <span className="Add-title">Import from Github</span>
                                    <span className="Add-subtitle">
                                        Link your repository to <strong>FlowState!</strong> The AI will automatically read through your repository
                                        to track progress.
                                    </span>
                                </div>
                            </button>

                            <button className="Local-button" onClick={() => this.setLocal()}>
                                <div className="folder-icon">📁</div>
                                <div className="Add-text">
                                    <span className="Add-title">Add from Local Folder</span>
                                    <span className="Add-subtitle">
                                        Select a directory and fill out your project description.
                                        The AI will still auto-generate goals, ideas and suggestions.
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function AddProjectModelComponent({ onClose, onUpdateWorkflow, onAddProject }) {
    const [ImportType, setImportType] = useState(null);
    const [githubUrl, setGithubUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [projectData, setProjectData] = useState(null);
    const [selectedPath, setSelectedPath] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [projectIcon, setProjectIcon] = useState(null);
    const [cloneDir, setCloneDir] = useState('');
    const [detectedTechStack, setDetectedTechStack] = useState([]);
    const [detectedWorkflow, setDetectedWorkflow] = useState([]);

    // Auto-detect project icon from path
    const detectProjectIcon = async (path) => {
        try {
            const files = await readDirectory(path);

            const iconPatterns = [
                'icon.png', 'icon.jpg', 'icon.jpeg', 'icon.svg',
                'logo.png', 'logo.jpg', 'logo.jpeg', 'logo.svg',
                'app-icon.png', 'app-icon.jpg',
                'favicon.png', 'favicon.ico'
            ];

            for (const iconName of iconPatterns) {
                if (files.includes(iconName)) {
                    return `${path}/${iconName}`;
                }
            }

            if (files.includes('public')) {
                try {
                    const publicFiles = await readDirectory(`${path}/public`);
                    for (const iconName of iconPatterns) {
                        if (publicFiles.includes(iconName)) {
                            return `${path}/public/${iconName}`;
                        }
                    }
                } catch (e) {
                    console.log('No public folder');
                }
            }

            if (files.includes('assets')) {
                try {
                    const assetsFiles = await readDirectory(`${path}/assets`);
                    for (const iconName of iconPatterns) {
                        if (assetsFiles.includes(iconName)) {
                            return `${path}/assets/${iconName}`;
                        }
                    }
                } catch (e) {
                    console.log('No assets folder');
                }
            }

            if (files.includes('src')) {
                try {
                    const srcFiles = await readDirectory(`${path}/src`);
                    if (srcFiles.includes('assets')) {
                        const srcAssetsFiles = await readDirectory(`${path}/src/assets`);
                        for (const iconName of iconPatterns) {
                            if (srcAssetsFiles.includes(iconName)) {
                                return `${path}/src/assets/${iconName}`;
                            }
                        }
                    }
                } catch (e) {
                    console.log('No src/assets folder');
                }
            }

            return null;
        } catch (err) {
            console.error('Error detecting project icon:', err);
            return null;
        }
    };

    const detectTechStack = async (path) => {
        try {
            const files = await readDirectory(path);
            const techStack = new Set();

            if (files.includes('package.json')) {
                try {
                    const packageJson = await readFile(`${path}/package.json`);
                    const pkg = JSON.parse(packageJson);
                    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

                    if (deps.react) techStack.add('React');
                    if (deps.vue) techStack.add('Vue');
                    if (deps['@angular/core']) techStack.add('Angular');
                    if (deps.express) techStack.add('Express');
                    if (deps.next) techStack.add('Next.js');
                    if (deps.typescript) techStack.add('TypeScript');
                    if (deps.tailwindcss) techStack.add('Tailwind CSS');
                    if (deps.electron) techStack.add('Electron');
                    if (deps.svelte) techStack.add('Svelte');
                    if (deps['three']) techStack.add('Three.js');
                } catch (e) {
                    console.log('Could not parse package.json');
                }
            }

            if (files.includes('requirements.txt') || files.includes('setup.py') || files.some(f => f.endsWith('.py'))) techStack.add('Python');
            if (files.includes('pom.xml') || files.includes('build.gradle') || files.some(f => f.endsWith('.java'))) techStack.add('Java');
            if (files.some(f => f.endsWith('.csproj')) || files.some(f => f.endsWith('.sln'))) techStack.add('.NET / C#');
            if (files.includes('go.mod') || files.some(f => f.endsWith('.go'))) techStack.add('Go');
            if (files.includes('Cargo.toml') || files.some(f => f.endsWith('.rs'))) techStack.add('Rust');
            if (files.includes('Gemfile') || files.some(f => f.endsWith('.rb'))) techStack.add('Ruby');
            if (files.includes('composer.json') || files.some(f => f.endsWith('.php'))) techStack.add('PHP');
            if (files.some(f => f.endsWith('.cpp') || f.endsWith('.hpp') || f.endsWith('.c') || f.endsWith('.h'))) techStack.add('C / C++');

            return Array.from(techStack);
        } catch (err) {
            console.error('Error detecting tech stack:', err);
            return [];
        }
    };

    const detectWorkflowTools = async (path) => {
        try {
            const files = await readDirectory(path);
            const tools = [];

            if (files.includes('.vscode')) {
                const vscodePath = await findApplication('Visual Studio Code');
                if (vscodePath) {
                    const icon = await getApplicationIcon(vscodePath);
                    tools.push({ name: 'VS Code', path: vscodePath, icon: icon || defaultIcon });
                }
            }

            if (files.includes('.idea')) {
                const ideaPath = await findApplication('IntelliJ IDEA');
                if (ideaPath) {
                    const icon = await getApplicationIcon(ideaPath);
                    tools.push({ name: 'IntelliJ IDEA', path: ideaPath, icon: icon || defaultIcon });
                }
            }

            return tools;
        } catch (err) {
            console.error('Error detecting workflow tools:', err);
            return [];
        }
    };

    const handleChangeIcon = async () => {
        try {
            const iconPath = await openImageDialog();
            if (iconPath) {
                setProjectIcon(iconPath);
            }
        } catch (err) {
            console.error('Failed to select icon:', err);
        }
    };

    const handleAddTech = () => {
        const tech = prompt('Enter technology name:');
        if (tech && tech.trim()) {
            setDetectedTechStack([...detectedTechStack, tech.trim()]);
        }
    };

    const handleRemoveTech = (index) => {
        setDetectedTechStack(detectedTechStack.filter((_, i) => i !== index));
    };

    const handleAddWorkflowTool = async () => {
        try {
            const exePath = await window.electronAPI.openExeDialog();
            if (!exePath) return;

            const toolInfo = await window.electronAPI.sendPathToBackend(exePath);
            setDetectedWorkflow([...detectedWorkflow, toolInfo]);
        } catch (err) {
            console.error('Failed to add workflow tool:', err);
        }
    };

    const handleRemoveWorkflowTool = (index) => {
        setDetectedWorkflow(detectedWorkflow.filter((_, i) => i !== index));
    };

    // Finalize and create project
    const handleCreateProject = async () => {
        setIsLoading(true);

        try {
            const newProject = {
                id: Date.now().toString(),
                title: projectTitle || projectData.title,
                subtitle: projectData.githubUrl ? 'Imported from GitHub' : 'Local Project',
                path: selectedPath,
                icon: projectIcon,
                techStack: detectedTechStack.length > 0 ? detectedTechStack : ['Unknown'],
                workflow: detectedWorkflow,
                githubUrl: projectData?.githubUrl || githubUrl || null,
                createdAt: new Date().toISOString(),
                lastOpened: new Date().toISOString(),
                isPinned: false,
                insights: 'AI is analyzing your project files for insights...'
            };

            await exportProject(newProject);

            if (onAddProject) {
                onAddProject(newProject);
            }

            onClose();
        } catch (err) {
            setError('Failed to create project');
            setIsLoading(false);
        }
    };

    // Initial selection screen
    if (!ImportType) {
        const model = new AddProjectModel(onClose, onUpdateWorkflow, setImportType);
        return model.render();
    }

    // GitHub import screen
    if (ImportType === 'github') {
        const handleGitHubImport = async () => {
            if (!githubUrl.trim()) {
                setError('Please enter a GitHub URL');
                return;
            }

            if (!isValidGitHubUrl(githubUrl)) {
                setError('Please enter a valid GitHub URL');
                return;
            }

            setIsLoading(true);
            setError('');

            try {
                const localPath = await cloneGitHubRepo(githubUrl, cloneDir || null);
                const folderName = githubUrl.split('/').pop().replace('.git', '');

                setSelectedPath(localPath);
                setProjectTitle(folderName);

                // Detect everything
                const icon = await detectProjectIcon(localPath);
                const techStack = await detectTechStack(localPath);
                const workflow = await detectWorkflowTools(localPath);

                setProjectIcon(icon || defaultIcon);
                setDetectedTechStack(techStack);
                setDetectedWorkflow(workflow);

                setProjectData({
                    title: folderName,
                    path: localPath,
                    icon: icon || defaultIcon,
                    techStack,
                    workflow,
                    githubUrl
                });

                setIsLoading(false);
                setImportType('configure');
            } catch (err) {
                setError(err.message || 'Failed to import from GitHub');
                setIsLoading(false);
            }
        };

        return (
            <div className="overlay" onClick={onClose}>
                <div className="project-model" onClick={(e) => e.stopPropagation()}>

                    <div className="model-header">
                        <h2 className="model-title">Import from Repository</h2>
                    </div>

                    <div className="model-content">
                        <div className="model-section">
                            <h3>Repository URL</h3>
                            <input
                                type="text"
                                className="title-input"
                                placeholder="https://github.com/username/repo"
                                value={githubUrl}
                                onChange={(e) => {
                                    setGithubUrl(e.target.value);
                                    setError('');
                                }}
                                disabled={isLoading}
                            />

                            <div className="Directory-section">
                                <button className="path-button" onClick={async () => {
                                    const dir = await openDirectoryDialog();
                                    if (dir) setCloneDir(dir);
                                }}>...</button>
                                <p className="path-text">{cloneDir || 'Default temporary folder'}</p>
                            </div>

                            <p className="gitmodel-subtitle">Note: Private repositories may require authentication</p>

                            {error && (
                                <p className="error-message">
                                    {error}
                                </p>
                            )}

                            {isLoading && (
                                <div className="loading-container">
                                    <p className="loading-text">
                                        Cloning repository and analyzing project...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="Add-subbuttons">
                        <button
                            className="secondary-action-btn"
                            onClick={() => setImportType(null)}
                            disabled={isLoading}
                        >
                            Back
                        </button>
                        <button
                            className={`primary-action-btn ${(!githubUrl.trim() || isLoading) ? 'disabled' : ''}`}
                            onClick={handleGitHubImport}
                            disabled={!githubUrl.trim() || isLoading}
                        >
                            {isLoading ? 'Importing...' : 'Import'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (ImportType === 'local') {
        const handleLocalImport = async () => {
            setIsLoading(true);
            setError('');

            try {
                const path = await openDirectoryDialog();
                if (!path) {
                    setIsLoading(false);
                    return;
                }

                const folderName = path.split(/[/\\]/).pop();
                setSelectedPath(path);
                setProjectTitle(folderName);

                // Detect everything
                const icon = await detectProjectIcon(path);
                const techStack = await detectTechStack(path);
                const workflow = await detectWorkflowTools(path);

                setProjectIcon(icon || defaultIcon);
                setDetectedTechStack(techStack);
                setDetectedWorkflow(workflow);

                setProjectData({
                    title: folderName,
                    path,
                    icon: icon || defaultIcon,
                    techStack,
                    workflow
                });

                setIsLoading(false);
                setImportType('configure');
            } catch (err) {
                setError(err.message || 'Failed to import local folder');
                setIsLoading(false);
            }
        };

        return (
            <div className="overlay" onClick={onClose}>
                <div className="project-model" onClick={(e) => e.stopPropagation()}>
                    <div className="model-header">
                        <h2 className="model-title">Open from Folder</h2>
                    </div>

                    <div className="model-content">
                        <p className="model-subtitle">Select a local folder to import as a project.</p>
                        <p className="gitmodel-subtitle">
                            FlowState will automatically detect your tech stack and workflow tools.
                        </p>

                        {error && (
                            <p className="error-message">
                                {error}
                            </p>
                        )}

                        {isLoading && (
                            <div className="loading-container">
                                <p className="loading-text">
                                    Analyzing project files...
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="Add-subbuttons">
                        <button
                            className="secondary-action-btn"
                            onClick={() => setImportType(null)}
                            disabled={isLoading}
                        >
                            Back
                        </button>
                        <button
                            className={`primary-action-btn ${isLoading ? 'disabled' : ''}`}
                            onClick={handleLocalImport}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Analyzing...' : 'Select Folder'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Configure project screen
    if (ImportType === 'configure') {
        return (
            <div className="overlay" onClick={onClose}>
                <div className="project-model config-modal" onClick={(e) => e.stopPropagation()}>

                    <div className="model-header">
                        <h2 className="model-title">Configure Project</h2>
                    </div>

                    <div className="model-content config-scrollable">
                        <div className="model-section">
                            <h3>Project Icon</h3>
                            <div className="icon-selection-container">
                                <img
                                    src={projectIcon || defaultIcon}
                                    alt="Project icon"
                                    className="config-project-icon"
                                />
                                <div className="icon-selection-info">
                                    <p className="icon-status-text">
                                        {projectIcon && projectIcon !== defaultIcon
                                            ? 'Icon detected'
                                            : 'No icon found - using default'}
                                    </p>
                                    <button onClick={handleChangeIcon} className="done-btn">
                                        Choose Different Icon
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="model-section">
                            <h3>Project Title</h3>
                            <input
                                type="text"
                                className="title-input"
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                            />
                        </div>

                        <div className="model-section">
                            <h3>Detected Tech Stack</h3>
                            <div className="tags">
                                {detectedTechStack.length > 0 ? (
                                    detectedTechStack.map((tech, idx) => (
                                        <span key={idx} className="tag editable-tag">
                                            {tech}
                                            <button
                                                className="remove-tag-btn"
                                                onClick={() => handleRemoveTech(idx)}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="no-data-text">
                                        No tech stack detected
                                    </p>
                                )}
                            </div>
                            <button className="add-workflow-btn" onClick={handleAddTech}>
                                + Add Technology
                            </button>
                        </div>

                        <div className="model-section">
                            <h3>Detected Workflow Tools</h3>
                            <div className="workflow-list">
                                {detectedWorkflow.length > 0 ? (
                                    detectedWorkflow.map((tool, idx) => (
                                        <div key={idx} className="workflow-item">
                                            <div className="workflow-icon">
                                                <img src={tool.icon || defaultIcon} alt={tool.name} />
                                            </div>
                                            <div className="workflow-info">
                                                <div className="workflow-header">
                                                    <span className="workflow-name">{tool.name}</span>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => handleRemoveWorkflowTool(idx)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <span className="workflow-path">{tool.path}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-text">
                                        No workflow tools detected - you can add them later
                                    </p>
                                )}
                            </div>
                            <button className="add-workflow-btn" onClick={handleAddWorkflowTool}>
                                + Add Tool
                            </button>
                        </div>

                        <div className="model-section">
                            <h3>Project Location</h3>
                            <div className="path-text">
                                {selectedPath}
                            </div>
                        </div>
                    </div>

                    <div className="Add-subbuttons">
                        <button
                            className="secondary-action-btn"
                            onClick={() => {
                                setImportType(null);
                                setProjectData(null);
                                setProjectTitle('');
                                setProjectIcon(null);
                                setDetectedTechStack([]);
                                setDetectedWorkflow([]);
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className={`primary-action-btn ${(!projectTitle.trim() || isLoading) ? 'disabled' : ''}`}
                            onClick={handleCreateProject}
                            disabled={!projectTitle.trim() || isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddProjectModelComponent;