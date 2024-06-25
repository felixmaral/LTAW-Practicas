const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const url = require('url');
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const ip = require('ip');

const PORT = 9090;

// Crear app Express
const appExpress = express();

// Crear Servidor a partir de la App express con el modulo http
const server = http.createServer(appExpress);

// Crear websocket
const io = socket(server);

//-- WebSocket
const connectedUsers = new Map();

appExpress.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    connectedUsers.set(socket.id, nickname);
    socket.emit('message', { nickname: 'Servidor', message: `¡Bienvenido al chat, ${nickname}!` });
    socket.broadcast.emit('message', { nickname: 'Servidor', message: `${nickname} se ha unido al chat` });
    io.emit('userCount', connectedUsers.size); // Actualizar el número de usuarios conectados
  });

  socket.on('message', (message) => {
    if (message.startsWith('/')) {
      handleCommand(socket, message);
    } else {
      broadcastMessage(socket.nickname, message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.nickname) {
      broadcastMessage('Servidor', `${socket.nickname} se ha desconectado`);
      connectedUsers.delete(socket.id);
      io.emit('userCount', connectedUsers.size); // Actualizar número de usuarios conectados
    }
  });

  const broadcastMessage = (sender, message) => {
    io.emit('message', { nickname: sender, message });
  };

  const handleCommand = (socket, message) => {
    const command = message.substring(1).trim(); // Eliminar el '/' y espacios en blanco

    switch (command) {
      case 'help':
        socket.emit('message', { nickname: 'Servidor', message: `Comandos disponibles: /help, /list, /hello, /date` });
        break;
      case 'list':
        const usersList = Array.from(connectedUsers.values()).join(', ');
        socket.emit('message', { nickname: 'Servidor', message: `Usuarios conectados: ${usersList}` });
        break;
      case 'hello':
        socket.emit('message', { nickname: 'Servidor', message: `Hola, ${socket.nickname}!` });
        break;
      case 'date':
        const currentDate = new Date().toLocaleString();
        socket.emit('message', { nickname: 'Servidor', message: `Fecha y hora actual: ${currentDate}` });
        break;
      default:
        socket.emit('message', { nickname: 'Servidor', message: `Comando no reconocido. Escribe /help para ver los comandos disponibles.` });
        break;
    }
  };
});

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Cargar la interfaz gráfica desde el servidor Socket.io
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.webContents.openDevTools(); // Abre las herramientas de desarrollo

  // Conectar con el servidor Socket.io en el lado del cliente
  const socketClient = require('socket.io-client');
  const socket = socketClient(`http://localhost:${PORT}`);

  socket.on('connect', () => {
    console.log('Conectado al servidor Socket.io');
  });

  socket.on('message', (data) => {
    const { nickname, message } = data;
    // Aquí puedes manejar los mensajes recibidos del servidor Socket.io
    console.log(`${nickname}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log('Desconectado del servidor Socket.io');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
