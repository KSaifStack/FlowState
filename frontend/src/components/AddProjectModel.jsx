/**  NOTE: This is prob gonna be the hardest thing on my part depending how you want to handle this.
     What I plan to do is have two windows open depending on what the user.

     GITHUB BUTTON: will open a window with needed info for creating a project(simliar to docktask).
     but the information will already be filled with information from the github.

     LOCAL BUTTON: will open a window in the same format without the prefilled info.
*/
import GithubIcon from '../assets/images/Github.png';
class AddProjectModel {
    constructor(onClose, onUpdateWorkflow) {
        this.onClose = onClose;
        this.onUpdateWorkflow = onUpdateWorkflow;
    }

    openGithub() {
        console.log("Opened Github link");
        // TODO:
        // - Prompt for GitHub URL
        // - Fetch repo info
        // - Auto-fill project fields using AI
    }

    async openInFileManager() {

        window.electronAPI.openProjDirectory(this.project.path)

        console.log("Opened file manager");
    }

    render() {
        return (
            <div className="overlay" onClick={this.onClose}>
                <div
                    className="project-model"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="model-header">
                        <h2 className="model-title">Add New Project</h2>
                        <button
                            className="close-button"
                            onClick={this.onClose}
                        >
                            ×
                        </button>
                    </div>

                    <div className="model-content">
                        <p className="model-subtitle">
                            Choose how you want to create your project
                        </p>

                        <div className="action-buttons vertical">
                            <button
                                className="Github-button"
                                onClick={() => this.openGithub()}
                            >
                                <img  src={GithubIcon} alt="Github" className="github-icon" />
                                Import from GitHub
                            </button>

                            <button
                                className="Local-button"
                                onClick={() => this.openInFileManager()}
                            >
                                Import from Local Folder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function AddProjectModelComponent({ onClose, onUpdateWorkflow }) {
    const model = new AddProjectModel(onClose, onUpdateWorkflow);
    return model.render();
}

export default AddProjectModelComponent;
