const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');

  socket.on('join', (nickname) => {
    socket.nickname = nickname;
    socket.emit('message', { nickname: 'Servidor', message: `¡Bienvenido al chat, ${nickname}!` });
    socket.broadcast.emit('message', { nickname: 'Servidor', message: `${nickname} se ha unido al chat` });
  });

  socket.on('message', (message) => {
    if (message.startsWith('/')) {
      handleCommand(message);
    } else {
      broadcastMessage(`${socket.nickname}`, message);
    }
  });

  socket.on('disconnect', () => {
    if (socket.nickname) {
      broadcastMessage('Servidor', `${socket.nickname} se ha desconectado`);
    }
  });

  const broadcastMessage = (sender, message) => {
    io.emit('message', { nickname: sender, message });
  };

  const handleCommand = (message) => {
    const command = message.substring(1).trim(); // Eliminar el '/' y espacios en blanco

    switch (command) {
      case 'help':
        socket.emit('message', { nickname: 'Servidor', message: `Comandos disponibles: /help, /list, /hello, /date` });
        break;
      case 'list':
        const connectedUsers = Object.keys(io.sockets.sockets).length;
        socket.emit('message', { nickname: 'Servidor', message: `Usuarios conectados: ${connectedUsers}` });
        break;
      case 'hello':
        socket.emit('message', { nickname: 'Servidor', message: `Hola, ${socket.nickname}!` });
        break;
      case 'date':
        const currentDate = new Date().toLocaleDateString();
        socket.emit('message', { nickname: 'Servidor', message: `Fecha actual: ${currentDate}` });
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
