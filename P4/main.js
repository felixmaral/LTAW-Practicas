// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Habilitar nodeIntegration
      contextIsolation: false // Desactivar el aislamiento de contexto
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Enviar las versiones al frontend
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-info', {
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      electronVersion: process.versions.electron,
      serverUrl: 'http://localhost:3000'
    });
  });
}

app.on('ready', () => {
  serverProcess = fork(path.join(__dirname, 'server.js'));
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  serverProcess.kill();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
