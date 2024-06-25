const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const ip = require('ip');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  // Open the DevTools.
  // win.webContents.openDevTools();

  // Send versions info to renderer process
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('versions', {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      url: `http://${ip.address()}:3000`
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Server code for chat application
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const chatApp = express();
const server = http.createServer(chatApp);
const io = socketIo(server);

const PORT = 3000;

let users = [];

chatApp.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    users.push({ id: socket.id, nickname });
    socket.broadcast.emit('message', { nickname: 'Servidor', message: `${nickname} se ha unido al chat` });
    updateUserCount();
  });

  socket.on('message', (message) => {
    if (message.startsWith('/')) {
      handleCommand(message);
    } else {
      io.emit('message', { nickname: socket.nickname, message });
    }
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', { nickname: socket.nickname });
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', { nickname: socket.nickname });
  });

  socket.on('disconnect', () => {
    if (socket.nickname) {
      const index = users.findIndex(user => user.id === socket.id);
      if (index !== -1) {
        const { nickname } = users[index];
        users.splice(index, 1);
        io.emit('message', { nickname: 'Servidor', message: `${nickname} se ha desconectado` });
        updateUserCount();
      }
    }
  });

  const updateUserCount = () => {
    io.emit('userCount', users.length);
  };

  const handleCommand = (message) => {
    const command = message.substr(1).toLowerCase().trim();
    switch (command) {
      case 'help':
        socket.emit('message', { nickname: 'Servidor', message: 'Lista de comandos: /help, /list, /hello, /date' });
        break;
      case 'list':
        socket.emit('message', { nickname: 'Servidor', message: `Usuarios conectados: ${users.length}` });
        break;
      case 'hello':
        socket.emit('message', { nickname: 'Servidor', message: '¡Hola! Bienvenido al chat' });
        break;
      case 'date':
        socket.emit('message', { nickname: 'Servidor', message: `Fecha actual: ${new Date().toLocaleDateString()}` });
        break;
      default:
        socket.emit('message', { nickname: 'Servidor', message: `Comando desconocido: ${message}` });
        break;
    }
  };
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
