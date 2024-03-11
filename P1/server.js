const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Definir el puerto a utilizar
const PUERTO = 9090;

const pagina_main = 'index.html'
const pagina_error = 'error.html'

fs.readFile(pagina_main, 'utf8', (err, data_index) => {
    if (err) {
        console.log('Error al leer el archivo')
    }
    console.log('Archivo "' + pagina_main + '" leido')
});

const server = http.createServer((req, res)=>{
    console.log("Petición recibida");

    //-- Valores de la respuesta por defecto (Ok)
    let code = 200;
    let code_msg = "OK";
    let page = data;

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log('Ruta: ' + url.pathname);

    //-- Cualquier recurso que no sea la página principal
    //-- genera un error
    if (url.pathname != '/') {
        code = 404;
        code_msg = "Not Found";
        page = pagina_error;
    }

    //-- Generar la respusta en función de las variables
    //-- code, code_msg y page
    res.statusCode = code;
    res.statusMessage = code_msg;
    res.setHeader('Content-Type','text/html');
    res.write(page);
    res.end();
});

//-- Activar el servidor: ¡Que empiece la fiesta!
server.listen(PUERTO);

console.log("\n Servidor Activo en " + PUERTO + '\n');