Flowstate is built with:

* Electron (desktop shell)
* React (frontend UI)
* C# / ASP.NET Core (backend API)

The backend is a local-only REST API, spawned automatically by Electron.

Folder Structure

flowstate/
├─ Backend/             # C# ASP.NET Core backend project
│   ├─ Backend.csproj
│   ├─ Program.cs
│   └─ Controllers/
├─ frontend/            # React (Vite) frontend
│   ├─ package.json
│   ├─ src/
│   └─ dist/            # Production build (after npm run build)
├─ electron/            # Electron shell
│   ├─ main.js
│   ├─ package.json
│   └─ backend-win/     # Published backend for Windows
│   └─ backend-mac/     # Published backend for macOS
│   └─ backend-linux/   # Published backend for Linux
└─ start-dev.bat        # Windows dev helper to run React + Electron

Prerequisites

* Node.js >= 18
* npm >= 9
* .NET SDK >= 7 LTS
* Windows/macOS/Linux development environment

> Windows users: Make sure PowerShell or CMD is available.

Development Setup

1. Install dependencies

cd frontend
npm install

cd ../electron
npm install

2. Publish backend (once per platform)

* Windows:

cd ../Backend
dotnet publish -c Release -r win-x64 --self-contained -o ../electron/backend-win

* macOS:

dotnet publish -c Release -r osx-x64 --self-contained -o ../electron/backend-mac

* Linux:

dotnet publish -c Release -r linux-x64 --self-contained -o ../electron/backend-linux

> This generates platform-specific executables for Electron to spawn.

3. Run in development

Use the provided batch script (Windows):

start-dev.bat

* Opens React dev server in one terminal
* Opens Electron + backend in another
* Backend binds to 127.0.0.1:5180
* React dev server runs on localhost:5173

> Linux/macOS: run React and Electron separately:

cd frontend
npm run dev

cd ../electron
npm start

4. React ↔ Backend Communication

* Backend API: [http://127.0.0.1:5180/api/](http://127.0.0.1:5180/api/)

* Example health check endpoint: GET /api/health

* CORS is configured to allow localhost:5173 during development.

Production Build

1. Build React for production:

cd frontend
npm run build

* Generates frontend/dist folder.

2. Make sure backend executables exist in electron/backend-* folders (see Step 2).

3. Run Electron in production:

cd electron
npm start

> Electron automatically detects dev server vs production build.

Notes for Developers

* Port Conflicts: Backend always binds to 5180. Make sure no other process is using it.
* Backend auto-start: Electron spawns the backend; do not manually run dotnet run while testing Electron.
* Hot Reload: In dev mode, React hot reload works automatically. Backend changes require re-publishing.

Packaging / Distribution (Optional)

* Use electron-builder or electron-forge to package cross-platform executables.
* Ensure you include the published backend for each platform in the package.
* Update main.js paths if folder structure changes.

Troubleshooting

* ERR_FILE_NOT_FOUND: Make sure frontend/dist/index.html exists or run in dev mode.
* CORS errors: Ensure React dev server is on localhost:5173 and backend port matches 5180.
* Port already in use: Kill any process using port 5180 or change the backend port in Program.cs consistently.

Contact / Contributions

* For issues or contributions, please open a PR or issue in the repository.
* Follow the development steps above to run and test the app locally.