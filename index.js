const fs = require("fs");
const express = require('express');
const app = express(); //para librerias
const modelo = require("./servidor/modelo.js");

const PORT = process.env.PORT || 3000; //puerto que utilizara para escuchar

app.use(express.static(__dirname + "/")); //carga middleware
let sistema = new modelo.Sistema();

app.get('/', (request, response) => {
  var contenido=fs.readFileSync(__dirname+"/cliente/index.html");
    response.setHeader("Content-type","text/html");
    response.send(contenido);
});

app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log('Ctrl+C para salir');
});
