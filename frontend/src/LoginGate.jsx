import './App.css';
import TitleBar from './components/TitleBar.jsx';
import GithubIcon from './assets/images/Github.png';

function LoginGate({ onAuth }) {
    const loginWithGithub = async () => {
        // TODO: Backend will handle GitHub OAuth
        console.log('GitHub login button clicked');
        onAuth('github');
    };

    const loginLocal = () => {
        console.log('Local login button clicked');
        onAuth('local');
    }

    return (
        <div className="login-screen">
            <TitleBar authState="guest" />
            <div className="login-container">
                <div className="center-panel">
                    <p className="Title">FlowState</p>
                    <p className="Subtext">AI–Powered Project Manager.</p>
                    <button className="Github-button" onClick={loginWithGithub}>
                        <img src={GithubIcon} alt="Github" className="github-icon" />
                        Sign in with GitHub
                    </button>
                    <button className="Local-button" onClick={loginLocal}>
                        Sign in as a Local User
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginGate;