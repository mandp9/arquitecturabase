const fs = require("fs");
const express = require('express');
const app = express(); //para librerias
const passport=require("passport");
const cookieSession=require("cookie-session");
require("./servidor/passport-setup.js");
const modelo = require("./servidor/modelo.js");
const bodyParser=require("body-parser");

const PORT = process.env.PORT || 3000; //puerto que utilizara para escuchar

app.use(cookieSession({
 name: 'Sistema',
 keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

let sistema = new modelo.Sistema({test:false});

app.get("/auth/google",passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback',
 passport.authenticate('google', { failureRedirect: '/fallo' }),
 function(req, res) {
 res.redirect('/good');
});

app.get("/good", function(request,response){
 let email=request.user.emails[0].value;
  sistema.usuarioGoogle({"email":email},function(obj){
  response.cookie('nick',obj.email);
  response.redirect('/');
  });
});


app.get("/fallo",function(request,response){
 response.send({nick:"nook"})
});

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

app.use(express.static(__dirname + "/"));

app.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log('Ctrl+C para salir');
});

app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
    function(req, res) {
        res.redirect('/good');
    }
);

//node index.js