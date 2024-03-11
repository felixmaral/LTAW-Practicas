// Cargar modulos de Node JS

const http = require('http')
const url = require('url')

const URL = url.URL;

const puerto = 8080;

let count = 1;

function print_info_request(req) {

    const myURL = new URL(req.url, 'http://' + req.headers['host'])

    console.log('');
    console.log('Método: ' + req.method);
    console.log('Recurso: ' + req.url);
    console.log('Versión: ' + req.httpVersion);
    console.log('Cabeceras: \n');
    
    for (header_name in req.headers)
        console.log(header_name + ': ' + req.headers[header_name]);

    console.log('');
    console.log('URL completa: ' + myURL.href)
    console.log('Ruta: ' + myURL.pathname)

}

const server = http.createServer((req, res) => {
    //-- req: http.IncomingMessage: Mensaje de solicitud
    //-- res: http.ServerResponse: Mensaje de respuesta (vacío)


    //-- Indicamos que se ha recibido una petición
    console.log('Petición recibida ' + count);

    //-- Llamamos a la funcion de informacion de la solicitud
    print_info_request(req)

    res.write('Cuerpo de la respuesta');
    res.end();

    count += 1;
});

//-- Activar el servidor. A la escucha de peitciones en el puerto 8080
server.listen(puerto);

console.log('\n Servidor Activo \n')

