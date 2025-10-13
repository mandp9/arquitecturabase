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
app.get("/agregarUsuario/:nick",function(request,response){
    let nick=request.params.nick;
    let res=sistema.agregarUsuario(nick);
    response.json(res);
});

app.get('/obtenerUsuarios', function (req, res) {
  var dic = sistema.obtenerUsuarios();
  var lista = Object.keys(dic).map(n => dic[n]);
  res.json(lista);
});


app.get('/usuarioActivo/:nick', function (req, res) {
  var nick = req.params.nick;
  var activo = sistema.usuarioActivo(nick);
  res.json({ activo: activo }); // {activo:true/false}
});


app.get('/numeroUsuarios', function (req, res) {
  var num = sistema.numeroUsuarios();
  res.json({ num: num }); // {num:N}
});


app.get('/eliminarUsuario/:nick', function (req, res) {
  var nick = req.params.nick;
  var ok = sistema.eliminarUsuario(nick);
  res.json({ ok: ok }); // {ok:true/false}
});
app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log('Ctrl+C para salir');
});
