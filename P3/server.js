const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server);