import './App.css';
import TitleBar from './components/TitleBar.jsx';
function LoginGate({ onAuth }) {
    const loginWithGithub = async () => {
        // Later:
        // await window.electronAPI.auth.github();

        onAuth('github');
    };

    return (
        <div className="login-screen">
            <TitleBar />
            <div className="main-content">
                <div className="left-panel">
<button onClick={loginWithGithub}>
                Sign in with GitHub
            </button>
            </div>
            
        </div>
        </div>
    );
}
export default LoginGate;