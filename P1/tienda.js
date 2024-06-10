const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Definir el puerto a utilizar
const PUERTO = 9090;

const pagina_main = './pages/index.html'
const pagina_error = './pages/error.html'
let  fileListHtml = '<ul>'

//-- Función que añade a la lista (fileListHtml) los archivos que hay en un directorio (dir)
function generateFileList(dir) {
    const files = fs.readdirSync(dir); // Leer los archivos del directorio (devuelve un array de string)
    files.forEach(file => {
        fileListHtml += `<li>${file}</li>`;
    });
}

//-- Función principal de gestion de peticiones
const server = http.createServer((req, res)=> {

    console.log("Petición recibida");

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log('Ruta: ' + url.pathname);

    if (url.pathname == '/') {
        recurso = './pages' + url.pathname.substring(1)
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
            res.write(page);
            res.end();
        });
    }

    else if (url.pathname.endsWith('.css')) {
        recurso = './style/' + url.pathname.substring(1)
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

    else if (url.pathname.endsWith('.ico')) {
        recurso = './img/' + url.pathname.substring(1)
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
            res.setHeader('Content-Type','image/x-icon');
            res.write(data_index);
            res.end();
        });
    }

    else if (url.pathname.endsWith('.html')) {
        recurso = './pages/' + url.pathname.substring(1)
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
            res.setHeader('Content-Type','text/html');
            res.write(data_index);
            res.end();
        });
    }

    else if (url.pathname.endsWith('.jpeg')) {
        recurso = './img/' + url.pathname.substring(1)
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

    else if (url.pathname.endsWith('.jpg')) {
        recurso = './img/' + url.pathname.substring(1)
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
            res.setHeader('Content-Type','text/jpg');
            res.write(data_index);
            res.end();
        });
    }

    else  if (url.pathname == '/ls') {
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        
        generateFileList('./pages');
        generateFileList('./style');
        generateFileList('./img');
        
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File List</title>
            </head>
            <body>
                <h1>File List</h1>
                ${fileListHtml}
            </body>
            </html>
        `);

        fileListHtml = '<ul>'

        console.log('Lista de archivos enviada')
    } 

    else {
        console.log(req.url)
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

//-- Lanzar Servidor
server.listen(PUERTO);

console.log("\n Servidor Activo en " + PUERTO + '\n');