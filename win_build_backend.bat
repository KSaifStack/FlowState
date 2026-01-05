@echo off

REM Build dotnet backend and start React dev server
start cmd /k "cd frontend && npm install && npm run dev"

REM Give React dev server a moment to start
timeout /t 3 /nobreak >nul

REM Start Electron
start "" cmd /k "dotnet publish Backend -c Release -r win-x64 --self-contained -o ./electron/backend-win && cd electron && npm install && npm run dev"
