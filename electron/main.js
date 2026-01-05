const { ipcMain, app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const waitPort = require("wait-port");
const fs = require("fs");

let backendProcess;

const BACKEND_PORT = 5180;

// Detect OS and backend path
function getBackendPath() {
    const isWin = process.platform === "win32";
    const isMac = process.platform === "darwin";
    const isLinux = process.platform === "linux";

    if (isWin) return path.join(__dirname, "backend-win", "Backend.exe");
    if (isMac) return path.join(__dirname, "backend-osx", "Backend");
    if (isLinux) return path.join(__dirname, "backend-linux", "Backend");

    throw new Error("Unsupported platform");
}

function startBackend() {
    const backendPath = getBackendPath();

    backendProcess = spawn(backendPath, [], { stdio: "inherit" });

    backendProcess.on("exit", (code) => {
        console.log(`Backend exited with code ${code}`);
    });

    backendProcess.on("error", (err) => {
        console.error("Failed to start backend:", err);
    });
}

// Detect if React dev server is running
async function isDevServerRunning() {
    const open = await waitPort({ host: "localhost", port: 5173, timeout: 1000 });
    return open;
}

async function createWindow() {
    const devMode = await isDevServerRunning();

    // Start backend first
    startBackend();

    // Wait until backend is ready
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



let mainWindow;

// 👇 SINGLETON LOCK
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // Another instance is already running → exit immediately
    app.quit();
} else {
    // Fired when a second instance is launched
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

if (gotTheLock) {
    app.whenReady().then(createWindow);
}

// Kill backend on exit
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
        case 'minimize':
            win.minimize();
            break;
        case 'maximize':
            win.isMaximized() ? win.unmaximize() : win.maximize();
            break;
        case 'close':
            win.close();
            break;
    }
});