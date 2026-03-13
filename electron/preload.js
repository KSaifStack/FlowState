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

    onOAuthComplete: (cb) => {
        const listener = (_event, payload) => cb(payload);
        ipcRenderer.on('oauth-complete', listener);
        return () => ipcRenderer.removeListener('oauth-complete', listener);
    },

    startGitHubLogin: () => ipcRenderer.invoke('start-github-login'),

    getBackendCookies: () => ipcRenderer.invoke('get-backend-cookies'),

    pinProject: (projectId, isPinned) => ipcRenderer.invoke('pin-project', projectId, isPinned),
    deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
    getOSUsername: () => ipcRenderer.invoke('get-os-username'),
    cloneGitHubRepo: (url, targetDir) => ipcRenderer.invoke('clone-github-repo', url, targetDir),
    readDirectory: (path) => ipcRenderer.invoke('read-directory', path),
    readFile: (path) => ipcRenderer.invoke('read-file', path),
    findApplication: (name) => ipcRenderer.invoke('find-application', name),
    getApplicationIcon: (path) => ipcRenderer.invoke('get-application-icon', path),
});
