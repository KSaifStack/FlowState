const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 650,
    minWidth: 1100,
    minHeight: 650,
    icon: path.join(__dirname, 'assets/images/logo.png'),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,  
      nodeIntegration: false,  
    },
  });

  win.loadURL('http://localhost:5173');
  win.removeMenu();
}

ipcMain.on('window-control', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  switch (action) {
    case 'minimize': win.minimize(); break;
    case 'maximize':
      win.isMaximized() ? win.unmaximize() : win.maximize();
      break;
    case 'close': win.close(); break;
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
