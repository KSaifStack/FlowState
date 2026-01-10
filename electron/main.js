const { ipcMain, app, BrowserWindow, dialog, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const waitPort = require("wait-port");
const fs = require("fs");

let backendProcess;
let mainWindow;

const BACKEND_PORT = 5180;

// Detect OS 
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

function getBackendPath() {
    if (isWin) return path.join(__dirname, "backend-win", "Backend.exe");
    if (isMac) return path.join(__dirname, "backend-osx", "Backend");
    if (isLinux) return path.join(__dirname, "backend-linux", "Backend");
    throw new Error("Unsupported platform");
}

function startBackend() {
    const backendPath = getBackendPath();

    backendProcess = spawn(backendPath, ["--urls", `http://127.0.0.1:${BACKEND_PORT}`], { stdio: "inherit" });

    backendProcess.on("exit", (code) => {
        console.log(`Backend exited with code ${code}`);
    });

    backendProcess.on("error", (err) => {
        console.error("Failed to start backend:", err);
    });
}

// Detect if React dev server is running
async function isDevServerRunning() {
    return await waitPort({ host: "localhost", port: 5173, timeout: 1000 });
}

async function createWindow() {
    const devMode = await isDevServerRunning();

    startBackend();

    const backendReady = await waitPort({ host: "127.0.0.1", port: BACKEND_PORT, timeout: 10000 });
    if (!backendReady) {
        console.error(`Backend did not start on port ${BACKEND_PORT}`);
        app.quit();
        return;
    }

    mainWindow = new BrowserWindow({
        width: 1100,
        height: 650,
        minWidth: 1100,
        minHeight: 650,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
        frame: false
    });

    if (devMode) {
        console.log("Loading React via dev server...");
        mainWindow.loadURL("http://localhost:5173");
        console.log("React was succcessfuly loaded from the dev server!");
    } else {
        const indexPath = path.join(__dirname, "../frontend/dist/index.html");
        if (!fs.existsSync(indexPath)) {
            console.error("Production build not found! Run 'npm run build' in frontend first.");
            app.quit();
            return;
        }
        console.log("Loading production React build...");
        mainWindow.loadFile(indexPath);
    }
}

// SINGLETON LOCK
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

if (gotTheLock) app.whenReady().then(createWindow);

app.on("quit", () => {
    if (backendProcess) backendProcess.kill();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    switch (action) {
        case 'minimize': win.minimize(); break;
        case 'maximize': win.isMaximized() ? win.unmaximize() : win.maximize(); break;
        case 'close': win.close(); break;
    }
});

ipcMain.handle("open-exe-dialog", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "Executables/Shortcuts", extensions: ["exe", "lnk"] },
            { name: "All Files", extensions: ["*"] }
        ]
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("open-directory-dialog", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    return (!result.canceled && result.filePaths.length > 0) ? result.filePaths[0] : null;
});

ipcMain.handle('open-image-dialog', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'ico'] }]
    });
    return result.canceled ? null : result.filePaths[0];
});

async function sendPathToBackend(path) {
    const response = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/projdirectory/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
    });

    if (!response.ok) throw new Error("Backend request failed");
    return await response.json();
}

ipcMain.handle("open-proj-directory", async (_event, path) => {
    try {
        const validatedPath = await sendPathToBackend(path);
        if (!validatedPath || !validatedPath.path) throw new Error("Invalid response from backend");

        await shell.openPath(validatedPath.path);
        return { success: true };
    } catch (err) {
        console.error("Failed to open project directory:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("send-path-to-backend", async (_event, path) => await sendPathToBackend(path));

ipcMain.handle('open-tool', async (_event, toolPath) => {
    try {
        if (!toolPath) throw new Error('Tool path is empty');
        const result = await shell.openPath(toolPath);
        if (result) throw new Error(result);
        return { success: true };
    } catch (err) {
        console.error('Failed to open tool:', toolPath, err.message);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("export-project", async (_event, project) => {
    await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/exportjson/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
    });
});

ipcMain.handle('load-all-projects', async () => {
    try {
        // Compute the correct projects directory
        // __dirname points to electron folder, so go up one level to FlowState then electron/projects
        const projectsDir = path.join(__dirname, 'projects'); // Already correct if electron folder
        // If main.js is in FlowState/electron/, then projectsDir = FlowState/electron/projects

        if (!fs.existsSync(projectsDir)) return [];

        const files = fs.readdirSync(projectsDir)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(projectsDir, file)); // return full paths

        return files;
    } catch (err) {
        console.error('Failed to load project files:', err);
        return [];
    }
});

ipcMain.handle("import-project", async (_event, filePath) => {
    // Ensure the full path is absolute
    let fullPath = filePath;

    if (!path.isAbsolute(filePath)) {
        fullPath = path.join(__dirname, 'projects', filePath);
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }

    const response = await fetch("http://127.0.0.1:5180/api/importjson/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: fullPath }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    return await response.json();
});

