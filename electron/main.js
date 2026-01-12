const { ipcMain, app, BrowserWindow, dialog, shell, session } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const waitPort = require("wait-port");
const fs = require("fs");

const PROTOCOL = "flowstate";

let backendProcess;
let mainWindow;

const BACKEND_PORT = 5180;

// Detect OS
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const isLinux = process.platform === "linux";

/**
 * Search a list of candidate paths and return the first one that exists.
 */
function firstExisting(...candidates) {
    return candidates.find((p) => p && fs.existsSync(p));
}

/**
 * Resolve the backend executable path for both dev and packaged (production) builds.
 * Tries multiple common locations:
 *  - Packaged: process.resourcesPath (with/without 'app' subfolder)
 *  - Development / unpacked: __dirname-based locations
 *  - Repo publish fallbacks (bin/Release/.../publish or backend/publish)
 */
function getBackendPath() {
    const platformDir = isWin ? "backend-win" : isMac ? "backend-osx" : "backend-linux";
    const exeName = isWin ? "Backend.exe" : "Backend";

    const candidates = [
        // Packaged app common locations
        path.join(process.resourcesPath, "app", platformDir, exeName),
        path.join(process.resourcesPath, platformDir, exeName),

        // Classic electron dev layout (keeps backward compatibility)
        path.join(__dirname, "resources", "app", platformDir, exeName),
        path.join(__dirname, platformDir, exeName),

        // Repository publish locations (useful for local release testing)
        path.join(__dirname, "..", "backend", "bin", "Release", "net7.0", "publish", exeName),
        path.join(__dirname, "..", "backend", "publish", exeName),
    ];

    const found = firstExisting(...candidates);
    if (found) return found;

    throw new Error(
        `Unsupported platform or backend not found. Tried:\n${candidates.join("\n")}`
    );
}

/**
 * Resolve index.html for production builds.
 * Tries multiple common locations for packaged and dev builds.
 */
function findIndexHtml() {
    const candidates = [
        // Packaged app common locations
        path.join(process.resourcesPath, "app", "dist", "index.html"),
        path.join(process.resourcesPath, "dist", "index.html"),

        // Project dev/prod build outputs
        path.join(__dirname, "..", "frontend", "dist", "index.html"),
        path.join(__dirname, "dist", "index.html"),
    ];

    return firstExisting(...candidates);
}

function startBackend() {
    const backendPath = getBackendPath();

    backendProcess = spawn(backendPath, ["--urls", `http://127.0.0.1:${BACKEND_PORT}`], {
        stdio: "inherit",
        cwd: path.dirname(backendPath),
        env: {
            ...process.env,
            GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
            GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        },
    });

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

    const backendReady = await waitPort({
        host: "127.0.0.1",
        port: BACKEND_PORT,
        timeout: 10000,
    });

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
        frame: false,
    });

    if (devMode) {
        console.log("Loading React via dev server...");
        mainWindow.loadURL("http://localhost:5173");
        console.log("React was succcessfuly loaded from the dev server!");
    } else {
        const indexPath = findIndexHtml();
        if (!indexPath) {
            console.error(
                "Production build not found! Expected index.html in one of the standard dist locations. " +
                "Run the frontend build and ensure the packaged app includes the frontend 'dist' folder."
            );
            app.quit();
            return;
        } else {
            console.log("Found production index:", indexPath);
        }
        console.log("Loading production React build...");
        mainWindow.loadFile(indexPath);
    }
    // Handle deep link passed on FIRST launch (Windows sometimes does this)
    const initialUrl = process.argv.find((a) => a.startsWith(`${PROTOCOL}://`));
    if (initialUrl && initialUrl.startsWith(`${PROTOCOL}://oauth-complete`)) {
        console.log("OAuth complete deep link received (first-launch):", initialUrl);

        const normalized = initialUrl.replace(
            "flowstate://oauth-complete/",
            "flowstate://oauth-complete"
        );
        const parsed = new URL(normalized);
        const code = parsed.searchParams.get("code");

        mainWindow.webContents.once("did-finish-load", () => {
            mainWindow.webContents.send("oauth-complete", { code });
        });
    }
}

// SINGLETON LOCK
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", (_event, argv) => {
        console.log("second-instance argv:", argv);
        const url = argv.find((a) => a.startsWith(`${PROTOCOL}://`));
        if (url && url.startsWith(`${PROTOCOL}://oauth-complete`)) {
            console.log("OAuth deep link received:", url);
            console.log("Sending oauth-complete to renderer");

            const normalized = url.replace("flowstate://oauth-complete/", "flowstate://oauth-complete");
            const parsed = new URL(normalized);
            const code = parsed.searchParams.get("code");

            mainWindow?.webContents.send("oauth-complete", { code });
            mainWindow?.focus();
        }
    });
}

// --- Protocol registration (DEV + PROD) ---
if (process.defaultApp) {
    const appPath = path.resolve(__dirname);
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [appPath]);
} else {
    app.setAsDefaultProtocolClient(PROTOCOL);
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

ipcMain.on("window-control", (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    switch (action) {
        case "minimize":
            win.minimize();
            break;
        case "maximize":
            win.isMaximized() ? win.unmaximize() : win.maximize();
            break;
        case "close":
            win.close();
            break;
    }
});

ipcMain.handle("open-exe-dialog", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "Executables/Shortcuts", extensions: ["exe", "lnk"] },
            { name: "All Files", extensions: ["*"] },
        ],
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("open-directory-dialog", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null;
});

ipcMain.handle("open-image-dialog", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "ico"] }],
    });
    return result.canceled ? null : result.filePaths[0];
});

async function sendPathToBackend(p) {
    const response = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/projdirectory/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: p }),
    });

    if (!response.ok) throw new Error("Backend request failed");
    return await response.json();
}

ipcMain.handle("open-proj-directory", async (_event, p) => {
    try {
        const validatedPath = await sendPathToBackend(p);
        if (!validatedPath || !validatedPath.path) throw new Error("Invalid response from backend");

        await shell.openPath(validatedPath.path);
        return { success: true };
    } catch (err) {
        console.error("Failed to open project directory:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("send-path-to-backend", async (_event, p) => await sendPathToBackend(p));

ipcMain.handle("open-tool", async (_event, toolPath) => {
    try {
        if (!toolPath) throw new Error("Tool path is empty");
        const result = await shell.openPath(toolPath);
        if (result) throw new Error(result);
        return { success: true };
    } catch (err) {
        console.error("Failed to open tool:", toolPath, err.message);
        return { success: false, error: err.message };
    }
});

ipcMain.handle("export-project", async (_event, project) => {
    await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/exportjson/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
    });
});

ipcMain.handle("load-all-projects", async () => {
    try {
        const projectsDir = path.join(__dirname, "projects");
        if (!fs.existsSync(projectsDir)) return [];

        const files = fs
            .readdirSync(projectsDir)
            .filter((file) => file.endsWith(".json"))
            .map((file) => path.join(projectsDir, file));

        return files;
    } catch (err) {
        console.error("Failed to load project files:", err);
        return [];
    }
});

ipcMain.handle("import-project", async (_event, filePath) => {
    let fullPath = filePath;

    if (!path.isAbsolute(filePath)) {
        fullPath = path.join(__dirname, "projects", filePath);
    }

    if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
    }

    const response = await fetch(`http://127.0.0.1:${BACKEND_PORT}/api/importjson/send`, {
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

// Inspect Electron cookies for the backend URL (after /auth/exchange)
ipcMain.handle("get-backend-cookies", async () => {
    try {
        const cookies = await session.defaultSession.cookies.get({
            url: `http://127.0.0.1:${BACKEND_PORT}`,
        });

        return cookies.map((c) => ({
            name: c.name,
            domain: c.domain,
            path: c.path,
            httpOnly: c.httpOnly,
            secure: c.secure,
            sameSite: c.sameSite,
            session: c.session,
            expires: c.expirationDate,
        }));
    } catch (e) {
        return { error: e?.message || String(e) };
    }
});

ipcMain.handle("start-github-login", async () => {
    const url = `http://127.0.0.1:${BACKEND_PORT}/auth/github/login`;
    await shell.openExternal(url);
    return { ok: true };
});
