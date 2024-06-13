const http = require('http');
const fs = require('fs');
const path = require('path');

//-- Definir el puerto a utilizar y las rutas de las páginas principales
const PUERTO = 9090;

const pagina_main = './pages/index.html';
const pagina_error = './pages/error.html';

//-- Mapeo de extensiones a tipos de recurso y su contenedor
const mimeTypes = {
    '.html': { type: 'text/html', folder: './pages' },
    '.css': { type: 'text/css', folder: './style' },
    '.ico': { type: 'image/x-icon', folder: './img' },
    '.jpeg': { type: 'image/jpeg', folder: './img' },
    '.jpg': { type: 'image/jpg', folder: './img' }
};

//-- Función para manejar la lectura de archivos y respuesta
function handleFileResponse(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) { 
            console.error('Error al leer el archivo:', err); // mostrar error
            res.writeHead(404, { 'Content-Type': 'text/html' }); // cabecera de error
            fs.readFile(pagina_error, (err, data) => { // manejo de errores para la pagina de error
                if (err) {
                    res.end('Error 404: File not found'); 
                } else {
                    res.end(data); // envío de la pagina de error
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': contentType }); // cabecera de respuesta OK
            res.end(data); // envío del recurso
        }
    });
}

//-- Función para generar la lista de archivos
function generateFileList(dir) {
    return fs.readdirSync(dir).map(file => `<li>${file}</li>`).join(''); // lee los nombres de los archivos de un directorio y genera de manera iterativa el codigo html en forma de lista
}

//-- Función principal de gestión de peticiones
const server = http.createServer((req, res) => {

    console.log("Petición recibida");

    const url = new URL(req.url, 'http://' + req.headers['host']); // objeto URL de la peticion recibida
    const pathname = url.pathname; // extraccion de la ruta del objeto URL
    console.log('Ruta:', pathname);

    if (pathname === '/') { 
        handleFileResponse(res, pagina_main, 'text/html');
    } else if (pathname === '/ls') {
        let fileListHtml = '<ul>'; // generacion de la lista vaia
        fileListHtml += generateFileList('./pages'); // adición de los nombres de los ficheros de cada directorio en la lista utilizando la función 'generateFileList'
        fileListHtml += generateFileList('./style');
        fileListHtml += generateFileList('./img');
        fileListHtml += '</ul>';

        res.writeHead(200, { 'Content-Type': 'text/html' });
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
        console.log('Lista de archivos enviada');
    } else {
        const ext = path.extname(pathname);
        const mimeInfo = mimeTypes[ext];
        if (mimeInfo) { // si se conoce la extensión del recurso
            const recurso = path.join(mimeInfo.folder, pathname); // construccion de la ruta contenedora en el servidor
            handleFileResponse(res, recurso, mimeInfo.type);
        } else {
            handleFileResponse(res, pagina_error, 'text/html'); // si no se conoce la extension del recurso se ejecuta la funcion con la ruta de la pagina de error
        }
    }
});

//-- Lanzar Servidor
server.listen(PUERTO);
console.log("\n Servidor Activo en " + PUERTO + '\n');

