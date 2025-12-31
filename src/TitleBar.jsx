import './App.css';

function TitleBar() {
  return (
    <div className="title-bar">
      <div className="title">FlowState</div>
      <div className="window-controls">
        <button onClick={() => window.electronAPI.windowControl('minimize')}>—</button>
        <button onClick={() => window.electronAPI.windowControl('maximize')}>▢</button>
        <button onClick={() => window.electronAPI.windowControl('close')}>✕</button>
      </div>
    </div>
  );
}

export default TitleBar;
