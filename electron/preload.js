const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    windowControl: (action) => ipcRenderer.send('window-control', action),
    openExeDialog: () => ipcRenderer.invoke("open-exe-dialog"),
    openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog")
});

