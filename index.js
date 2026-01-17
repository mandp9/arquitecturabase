const fs = require("fs");
const express = require('express');
const app = express(); 
const passport = require("passport");
const cookieSession = require("cookie-session");
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require("body-parser");

const httpServer = require('http').Server(app);
const { Server } = require("socket.io");
const moduloWS = require("./servidor/servidorWS.js");

require("./servidor/passport-setup.js");
const modelo = require("./servidor/modelo.js");

const PORT = process.env.PORT || 3000; 

let sistema = new modelo.Sistema({test:false});

let ws = new moduloWS.WSServer();
let io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

app.use(cookieSession({
  name: 'Sistema',
  keys: [process.env.KEY1, process.env.KEY2]
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + "/"));

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
  },
  function(email, password, done) {
    sistema.loginUsuario({ "email": email, "password": password }, function(user) {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Email o contraseña incorrectos.' });
      }
    });
  }
));

const haIniciado = function(request, response, next){
  if (request.user){
    next();
  }
  else{
    response.redirect("/")
  }
}


app.get("/auth/google", passport.authenticate('google', { scope: ['profile','email'] }));

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

app.get("/fallo", function(request,response){
  response.send({nick:"nook"})
});

app.get('/', (request, response) => {
  var contenido = fs.readFileSync(__dirname + "/cliente/index.html", 'utf8');
  contenido = contenido.replace('%%GOOGLE_CLIENT_ID%%', process.env.GOOGLE_CLIENT_ID);
  contenido = contenido.replace('%%GOOGLE_ONETAP_CALLBACK%%', process.env.BASE_URL + '/oneTap/callback');
  response.setHeader("Content-type", "text/html");
  response.send(contenido);
});

app.get("/agregarUsuario/:nick",function(request,response){
    let nick=request.params.nick;
    let res=sistema.agregarUsuario(nick);
    response.json(res);
});

app.get("/obtenerUsuarios", haIniciado, function(request,response){
  let lista=sistema.obtenerUsuarios();
  response.send(lista);
});

app.get('/usuarioActivo/:nick', function (req, res) {
  var nick = req.params.nick;
  var activo = sistema.usuarioActivo(nick);
  res.json({ activo: activo }); 
});

app.get('/numeroUsuarios', function (req, res) {
  var num = sistema.numeroUsuarios();
  res.json({ num: num }); 
});

app.get('/eliminarUsuario/:nick', function (req, res) {
  var nick = req.params.nick;
  var ok = sistema.eliminarUsuario(nick);
  res.json({ ok: ok }); 
});

app.post('/loginUsuario',
  passport.authenticate("local", { failureRedirect: "/fallo" }),
  function(req, res) {
    res.redirect("/ok");
  }
);

app.get("/ok", function(request, response) {
  response.send({ nick: request.user.email }); 
});

app.get("/confirmarUsuario/:email/:key", function(request, response) {
    let email = request.params.email;
    let key = request.params.key;
    sistema.confirmarUsuario({ "email": email, "key": key }, function(usr) {
        if (usr.email != -1) {
            response.cookie('nick', usr.email); 
            response.redirect('/');
        } else {
            response.redirect('/fallo');
        }
    });
});

app.get("/cerrarSesion", haIniciado, function (request, response, next) {
    let nick = request.user ? request.user.nick : undefined; 
    request.logout(function(err) {
        if (err) { return next(err); }
        if (nick) {
            sistema.eliminarUsuario(nick); 
        }
        response.redirect("/"); 
    });
});

app.post('/oneTap/callback',
    passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
    function(req, res) {
        res.redirect('/good');
    }
);

app.post("/registrarUsuario",function(request,response){
  sistema.registrarUsuario(request.body,function(res){
    response.send({"nick":res.email});
  });
});

ws.lanzarServidor(io, sistema); 

app.get("/obtenerPartidas", haIniciado, function(request, response) {
    let lista = sistema.obtenerPartidasDisponibles();
    response.send(lista);
});

app.get("/partidaActiva/:email", haIniciado, function(request, response) {
    let email = request.params.email;
    let res = sistema.buscarPartidaDeUsuario(email);
    response.send(res);
});
app.get("/obtenerLogs", function(request, response) {
  sistema.obtenerLogs(function(logs) {
    response.send(logs);
  });
});
app.get("/obtenerUsuario/:nick", function(request, response) {
  let nick = request.params.nick;
  
  sistema.obtenerUsuario(nick, function(usuario) {
    response.send(usuario);
  });
});
httpServer.listen(PORT, () => {
    console.log(`App está escuchando en el puerto ${PORT}`);
    console.log('Ctrl+C para salir');
});

//node index.js
