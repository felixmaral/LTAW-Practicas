const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Definir el puerto a utilizar
const PUERTO = 9090;

const pagina_main = 'index.html'
const pagina_error = 'error.html'

//-- Función principal de gestion de peticiones
const server = http.createServer((req, res)=> {

    console.log("Petición recibida");

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log('Ruta: ' + url.pathname);

    if (url.pathname == '/' || url.pathname.endsWith(".html")) {
        recurso = url.pathname.substring(1)
        code = 200;
        code_msg = "Ok";
        fs.readFile(pagina_main, 'utf8', (err, data_index) => {
            if (err) {
                console.log('Error al leer el archivo')
            }
            console.log('Archivo "' + pagina_main + '" enviado')
            page = data_index;
            
            res.statusCode = code;
            res.statusMessage = code_msg;
            res.setHeader('Content-Type','text/html');
            res.write(data_index);
            res.end();
        });
    }

    else if (url.pathname.endsWith('.css')) {
        recurso = url.pathname.substring(1)
        code = 200;
        code_msg = "Ok";
        fs.readFile(recurso, 'utf8', (err, data_index) => {
            if (err) {
                console.log('Error al leer el archivo')
            }
            console.log('Archivo "' + recurso + '" leido')
            page = data_index;
            
            res.statusCode = code;
            res.statusMessage = code_msg;
            res.setHeader('Content-Type','text/css');
            res.write(data_index);
            res.end();
        });
    }

    else if (url.pathname.endsWith('.jpeg')) {
        recurso = url.pathname.substring(1)
        code = 200;
        code_msg = "Ok";
        fs.readFile(recurso, (err, data_index) => {
            if (err) {
                console.log('Error al leer el archivo')
            }
            console.log('Archivo "' + recurso + '" enviado')
            page = data_index;
            
            res.statusCode = code;
            res.statusMessage = code_msg;
            res.setHeader('Content-Type','text/jpeg');
            res.write(data_index);
            res.end();
        });
    }

    else {
        code = 404;
        code_msg = "Error";
        console.log('Error')
        fs.readFile(pagina_error, (err, data_index) => {
            if (err) {
                console.log('Error al leer el archivo')
            }
            console.log('Archivo "' + pagina_error + '" enviado')
            page = data_index;
            
            res.statusCode = code;
            res.statusMessage = code_msg;
            res.setHeader('Content-Type','text/html');
            res.write(data_index);
            res.end();
        });
    }
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("\n Servidor Activo en " + PUERTO + '\n');