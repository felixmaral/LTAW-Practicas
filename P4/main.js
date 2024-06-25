// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('closed', function () {
    mainWindow = null;
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
