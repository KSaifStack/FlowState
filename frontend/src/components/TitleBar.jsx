import '../App.css';
import logo from '../assets/images/logo.png';
function TitleBar() {
    return (
        <div className="title-bar">
            <button className="Titlebutton"><img id="TitleImage" src={logo} >
            </img>
            </button>

            <div className="window-controls">
                <div className="user-footer">
                    <img
                        src="https://github.com/KsaifStack.png"
                        alt="GitHub Profile"
                        className="github-avatar"
                    />
                    <div className="user-info">
                        <div className="github-username">KsaifStack</div>
                    </div>
                </div>
                <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
                <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
                <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
            </div>
        </div>
    );
}

export default TitleBar;
