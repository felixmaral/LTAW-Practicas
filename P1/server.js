const http = require('http');

//-- Definir el puerto a utilizar
const PUERTO = 9090;

//-- Crear el servidor
const fs = require('fs');

const TIENDA_INDEX = "index.html";
const TIENDA_CSS = "index.css";

const pagina_main = `

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="index.css">
    <title>Instrumentos Musicales</title>
</head>
<body>
    <header>
        <h1>Instrumentos Musicales</h1>
    </header>
    <section class="products">
        <article class="product">
            <img src="violin_bernd_hiller.jpeg" alt="violin_bernd_hiller">
            <h2>    Violín 4/4 - Bernd Hiller</h2>
            <p>Descripción del producto 1</p>
            <span class="price">$ 9555</span>
            <button>Añadir al carrito</button>
        </article>
        <article class="product">
            <img src="guitarra_electrica_red.jpeg" alt="Producto 2">
            <h2>Producto 2</h2>
            <p>Descripción del producto 2.</p>
            <span class="price">$24.99</span>
            <button>Añadir al carrito</button>
        </article>
        <!-- Agrega más productos según sea necesario -->
    </section>
    <footer>
        <p>&copy; 2024 Instrumentos Musicales</p>
    </footer>
</body>
</html>

`

const pagina_error = `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi tienda</title>
</head>
<body style="background-color: red">
    <h1 style="color: white">ERROR!!!!</h1>
</body>
</html>

`;

const server = http.createServer((req, res)=>{
    console.log("Petición recibida!");

    //-- Valores de la respuesta por defecto
    let code = 200;
    let code_msg = "OK";
    let page = pagina_main;

    //-- Analizar el recurso
    //-- Construir el objeto url con la url de la solicitud
    const url = new URL(req.url, 'http://' + req.headers['host']);
    console.log(url.pathname);

    //-- Cualquier recurso que no sea la página principal
    //-- genera un error
    //if (url.pathname != '/') {
    //    code = 404;
    //    code_msg = "Not Found";
    //   page = pagina_error;
    //}

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

console.log("Happy server activado!. Escuchando en puerto: " + PUERTO);