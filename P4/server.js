// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const connectedUsers = new Map();

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    connectedUsers.set(socket.id, nickname);
    socket.emit('message', { nickname: 'Servidor', message: `¡Bienvenido al chat, ${nickname}!` });
    socket.broadcast.emit('message', { nickname: 'Servidor', message: `${nickname} se ha unido al chat` });
    io.emit('userCount', connectedUsers.size);
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
      io.emit('userCount', connectedUsers.size);
    }
  });

  const broadcastMessage = (sender, message) => {
    io.emit('message', { nickname: sender, message });
  };

  const handleCommand = (socket, message) => {
    const command = message.substring(1).trim();

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

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
