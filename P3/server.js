// server.js

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
    socket.emit('message', { nickname: 'Servidor', message: `Bienvenido al chat, ${nickname}!` });
    socket.broadcast.emit('message', { nickname: 'Servidor', message: `${nickname} se ha unido al chat` });
  });

  socket.on('message', (message) => {
    io.emit('message', { nickname: socket.nickname, message });
  });

  socket.on('disconnect', () => {
    if (socket.nickname) {
      io.emit('message', { nickname: 'Servidor', message: `${socket.nickname} se ha desconectado` });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
