// Cargar modulos de Node JS

const http = require('http')

const server = http.createServer();

const Puerto = 8080;

function atender(req, res) {
    //-- req: http.IncomingMessage: Mensaje de solicitud
    //-- res: http.ServerResponse: Mensaje de respuesta (vacío)

    //-- Indicamos que se ha recibido una petición
    console.log('Petición recibida')

    res.write
}

//-- Activar la función de retrollamada del servidor
server.on('request', atender);

//-- Activar el servidor. A la escucha de peitciones en el puerto 8080
server.listen(Puerto);

console.log('\n Servidor Activo \n')

