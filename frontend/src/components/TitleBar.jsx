import '../App.css';
import logo from '../assets/images/logo.png';
import GithubModel from './GithubModel.jsx';
function TitleBar() {
    return (
        <div className="title-bar">
            <button className="Titlebutton"><img id="TitleImage" src={logo} >
            </img>
            </button>

            <div className="window-controls">
               <GithubModel />                
                <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
                <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
                <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
            </div>
        </div>
    );
}

export default TitleBar;
