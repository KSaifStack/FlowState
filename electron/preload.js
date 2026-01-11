const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    windowControl: (action) => ipcRenderer.send('window-control', action),
    openExeDialog: () => ipcRenderer.invoke("open-exe-dialog"),
    openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
    openProjDirectory: (path) => ipcRenderer.invoke("open-proj-directory", path),
    sendPathToBackend: (path) => ipcRenderer.invoke("send-path-to-backend", path),
    openTool: (path) => ipcRenderer.invoke("open-tool", path),
    openImageDialog: () => ipcRenderer.invoke('open-image-dialog'),
    exportProject: (project) => ipcRenderer.invoke("export-project", project),
    importProject: (path) => ipcRenderer.invoke("import-project", path),
    loadAllProjects: () => ipcRenderer.invoke('load-all-projects'),
    startGitHubLogin: () => ipcRenderer.invoke("start-github-login"),
    onOAuthComplete: (callback) => ipcRenderer.on("oauth-complete", (_evt, data) => callback(data)),
});
