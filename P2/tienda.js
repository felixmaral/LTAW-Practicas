const http = require('http');
const fs = require('fs');
const path = require('path');

const PUERTO = 9090;

const pagina_main = './pages/index.html';
const pagina_error = './pages/error.html';
const pagina_login = './pages/login.html';
const pagina_log_ok = './pages/log_ok.html';
const pagina_log_error = './pages/log_error.html';
const pagina_add_cart = './pages/add-to-cart.html';

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
            return;
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
            return;
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
                        handleFileResponse(res, pagina_log_ok, "text/html");
                        return;
                    } else {
                        console.log('Error al iniciar sesión');
                        handleFileResponse(res, pagina_log_error, 'text/html');
                        return;
                    }
                });
            } else {
                handleFileResponse(res, pagina_login, 'text/html');
                return;
            }
        } else if (pathname === '/add-to-cart') {
            const productId = searchParams.get('product');
            const cookies = req.headers.cookie;

            if (cookies) {
                const pares = cookies.split(';');
                let carritoEncontrado = false;
                let carritoValor = "";

                pares.forEach((element, index) => {
                    let [nombre, valor] = element.trim().split('=');

                    if (nombre === 'carrito') {
                        carritoEncontrado = true;
                        carritoValor = valor;
                    }
                });

                if (carritoEncontrado) {
                    let carritoArray = carritoValor.split(',');
                    if (!carritoArray.includes(productId)) {
                        carritoArray.push(productId);
                    }
                    res.setHeader('Set-Cookie', `carrito=${carritoArray.join(',')}; path=/`);
                } else {
                    res.setHeader('Set-Cookie', `carrito=${productId}; path=/`);
                }

                handleFileResponse(res, pagina_add_cart, 'text/html');
                return;
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="stylesheet" href="index.css">
                        <title>File List</title>
                    </head>
                    <body>
                        <h1>Necesitas Iniciar sesión para comprar</h1>
                        <li><a id="profile" href="login.html">Entrar</a></li>
                    </body>
                    </html>
                `);
                return;
            }
        } else if (pathname === '/carrito') {
            const cookies = req.headers.cookie;
            let carritoValor = null;

            if (cookies) {
                const pares = cookies.split(';');
                pares.forEach((element) => {
                    let [nombre, valor] = element.trim().split('=');
                    if (nombre === 'carrito') {
                        carritoValor = valor;
                    }
                });
            }

            if (carritoValor) {
                const carritoArray = carritoValor.split(',');

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

                    const productosCarrito = jsonData.productos.filter(producto => carritoArray.includes(producto.id));
                    let html = '<ul>';
                    let price_total = 0;
                    let price = '<p>';
                    productosCarrito.forEach(producto => {
                        html += `<li>${producto.nombre} - $${producto.precio}</li>`;
                        price_total += parseInt(producto.precio)
                    });

                    price += `Total: $ ${price_total} </p>`
                    html += '</ul>';

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link rel="stylesheet" href="index.css">
                            <title>Carrito de Compras</title>
                        </head>
                        <body>
                        <header>
                                <nav>
                                    <img src="logo.jpg" class=logo-img alt="Logo Temproove">
                                    <div class="logo">
                                        <h1>Temproove</h1>
                                    </div>
                                    <ul class="nav-links">
                                        <li><a id="profile" href="login.html">Entrar</a></li>
                                        <li><a href="index.html">Inicio</a></li>
                                        <li><a href="index.html#products">Productos</a></li>
                                        <li><a href="carrito">Carrito</a></li>
                                        <li><a href="#" id="logout" style="display:none; font-size: small;" >Cerrar Sesión</a></li>
                                    </ul>
                                </nav>
                        </header>
                        <section id="home" class="hero">
                            <div class="hero-content">
                                <h1>Carrito de Compras</h1>
                                ${html}
                                ${price}
                                <button id="delete-cookie">Eliminar Carrito</button>
                            </div>
                        </section>
                       
                        <script>
                            document.getElementById('delete-cookie').addEventListener('click', () => {
                                document.cookie = 'carrito=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                                location.reload();
                            });
                        </script>

                        <script>
                window.onload = function() {
                const cookies = document.cookie.split(';');
                let username = '';
    
                cookies.forEach(cookie => {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'username_session') {
                        username = value;
                    }
                });
    
                if (username) {
                document.querySelector('#profile').textContent = username;
                document.querySelector('#logout').style.display = 'block';
                }
    
                document.querySelector('#logout').addEventListener('click', function() {
                    document.cookie = 'username_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = 'carrito=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    location.reload();
                });
                };
                 </script>
                    </body>
                        </html>
                    `);
                });
                return;
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="stylesheet" href="index.css">
                        <title>Carrito de Compras</title>
                    </head>
                    <body>
                    <header>
        <nav>
            <img src="logo.jpg" class=logo-img alt="Logo Temproove">
            <div class="logo">
                <h1>Temproove</h1>
            </div>
            <ul class="nav-links">
                <li><a id="profile" href="login.html">Entrar</a></li>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="index.html#products">Productos</a></li>
                <li><a href="carrito">Carrito</a></li>
                <li><a href="#" id="logout" style="display:none; font-size: small;" >Cerrar Sesión</a></li>
            </ul>
        </nav>
    </header>
    <section id="home" class="hero">
            <div class="hero-content">
            <h1>Carrito de Compras</h1>
            <p>No hay productos en el carrito.</p>
            <button id="delete-cookie">Borrar Carrito</button>
            </div>
    </section>

    <script>
            window.onload = function() {
                const cookies = document.cookie.split(';');
                let username = '';
    
                cookies.forEach(cookie => {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'username_session') {
                        username = value;
                    }
                });
    
                if (username) {
                document.querySelector('#profile').textContent = username;
                document.querySelector('#logout').style.display = 'block';
            }
    
                document.querySelector('#logout').addEventListener('click', function() {
                    document.cookie = 'username_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = 'carrito=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    location.reload();
                });
            };
        </script>
                        <script>
                            document.getElementById('delete-cookie').addEventListener('click', () => {
                                document.cookie = 'carrito=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                                location.reload();
                            });
                        </script>
                    </body>
                    </html>
                `);
                return;
            }
        } else {
            const ext = path.extname(pathname);
            const mimeInfo = mimeTypes[ext];
            if (mimeInfo) {
                const recurso = path.join(mimeInfo.folder, pathname);
                handleFileResponse(res, recurso, mimeInfo.type);
                return;
            } else {
                handleFileResponse(res, pagina_error, 'text/html');
                return;
            }
        }
    } else {
        handleFileResponse(res, pagina_error, 'text/html');
        return;
    }
});

server.listen(PUERTO);
console.log("\nServidor Activo en " + PUERTO + "\n");
