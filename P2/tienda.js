const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');

const PUERTO = 9090;

const pagina_main = './pages/index.html';
const pagina_error = './pages/error.html';
const pagina_login = './pages/login.html';
const pagina_procesar = './pages/procesar.html';

const mimeTypes = {
    '.html': { type: 'text/html', folder: './pages' },
    '.css': { type: 'text/css', folder: './style' },
    '.ico': { type: 'image/x-icon', folder: './img' },
    '.jpeg': { type: 'image/jpeg', folder: './img' },
    '.jpg': { type: 'image/jpg', folder: './img' }
};

function handleFileResponse(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.readFile(pagina_error, (err, data) => {
                if (err) {
                    res.end('Error 404: File not found');
                } else {
                    res.end(data);
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function generateFileList(dir) {
    return fs.readdirSync(dir).map(file => `<li>${file}</li>`).join('');
}

function verificarCredenciales(username, password, usuarios) {
    for (let usuario of usuarios) {
        if (usuario.nombre === username && usuario.password === password) {
            return usuario;
        }
    }
    return null;
}

const server = http.createServer((req, res) => {
    console.log("Petición recibida");

    const url = new URL(req.url, 'http://' + req.headers['host']);
    const pathname = url.pathname;
    const searchParams = url.searchParams;
    console.log('Ruta:', pathname);

    if (req.method === 'GET') {
        if (pathname === '/') {
            handleFileResponse(res, pagina_main, 'text/html');
        } else if (pathname === '/ls') {
            let fileListHtml = '<ul>';
            fileListHtml += generateFileList('./pages');
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
        } else if (pathname === '/login') {
            const username = searchParams.get('username');
            const password = searchParams.get('password');

            if (username && password) {
                fs.readFile('tienda.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error al leer el archivo JSON:', err);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Error interno del servidor');
                        return;
                    }

                    let jsonData;

                    try {
                        jsonData = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Error al parsear el archivo JSON:', parseErr);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Error interno del servidor');
                        return;
                    }

                    const usuario = verificarCredenciales(username, password, jsonData.usuarios);

                    if (usuario) {
                        res.setHeader('Set-Cookie', `username_session=${username}; path=/`);
                        handleFileResponse(res, pagina_main, "text/html");
                    } else {
                        console.log('Error al iniciar sesión');
                        handleFileResponse(res, pagina_login, 'text/html');
                    }
                });
            } else {
                handleFileResponse(res, pagina_login, 'text/html');
            }
        } else if (pathname === '/procesar') {
            const direccion = searchParams.get('direccion');
            const tarjeta = searchParams.get('tarjeta');
            const cookies = req.headers.cookie;

            if (cookies) {
                const cookieMap = Object.fromEntries(cookies.split('; ').map(c => c.split('=')));
                const username = cookieMap['username'];

                fs.readFile('tienda.json', 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error al leer el archivo JSON:', err);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Error interno del servidor');
                        return;
                    }

                    let jsonData;

                    try {
                        jsonData = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Error al parsear el archivo JSON:', parseErr);
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end('Error interno del servidor');
                        return;
                    }

                    const nuevoPedido = {
                        nombreUsuario: username,
                        direccionEnvio: direccion,
                        numeroTarjeta: tarjeta,
                        productosComprados: []  // Añadir los productos comprados aquí
                    };

                    jsonData.pedidos.push(nuevoPedido);

                    fs.writeFile('tienda.json', JSON.stringify(jsonData, null, 2), (err) => {
                        if (err) {
                            console.error('Error al escribir en el archivo JSON:', err);
                            res.writeHead(500, { 'Content-Type': 'text/html' });
                            res.end('Error interno del servidor');
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end('Pedido procesado correctamente');
                    });
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('No hay usuario autenticado');
            }
        } else {
            const ext = path.extname(pathname);
            const mimeInfo = mimeTypes[ext];
            if (mimeInfo) {
                const recurso = path.join(mimeInfo.folder, pathname);
                handleFileResponse(res, recurso, mimeInfo.type);
            } else {
                handleFileResponse(res, pagina_error, 'text/html');
            }
        }
    } else {
        handleFileResponse(res, pagina_error, 'text/html');
    }
});

server.listen(PUERTO);
console.log("\nServidor Activo en " + PUERTO + "\n");

