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

  // Enviar mensaje de bienvenida solo al usuario que se conecta
  socket.emit('message', 'Bienvenido al chat!');

  // Anunciar a todos los usuarios cuando alguien se conecta
  socket.broadcast.emit('message', 'Un nuevo usuario se ha conectado');

  // Manejar mensajes del cliente
  socket.on('message', (message) => {
    if (message.startsWith('/')) {
      // Procesar comandos especiales
      handleCommand(socket, message);
    } else {
      // Reenviar mensaje a todos los usuarios
      io.emit('message', message);
    }
  });

  // Manejar desconexión de un usuario
  socket.on('disconnect', () => {
    io.emit('message', 'Un usuario se ha desconectado');
  });
});

// Función para manejar comandos especiales
function handleCommand(socket, command) {
  switch (command) {
    case '/help':
      socket.emit('message', 'Comandos disponibles: /help, /list, /hello, /date');
      break;
    case '/list':
      socket.emit('message', `Usuarios conectados: ${io.engine.clientsCount}`);
      break;
    case '/hello':
      socket.emit('message', '¡Hola! Bienvenido al chat');
      break;
    case '/date':
      socket.emit('message', `La fecha actual es: ${new Date().toLocaleDateString()}`);
      break;
    default:
      socket.emit('message', 'Comando no reconocido');
  }
}

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
