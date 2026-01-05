@echo off
REM Start React dev server
start "" cmd /k "cd frontend && npm install all && npm run dev"

REM Give React dev server a moment to start
timeout /t 3 /nobreak >nul

REM Start Electron
cd electron
npm install all
npm start
