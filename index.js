const fs = require("fs");
const express = require('express');
const app = express(); //para librerias
const passport=require("passport");
const cookieSession=require("cookie-session");
const LocalStrategy = require('passport-local').Strategy;
require("./servidor/passport-setup.js");
const modelo = require("./servidor/modelo.js");
const bodyParser=require("body-parser");

const PORT = process.env.PORT || 3000; //puerto que utilizara para escuchar

const haIniciado=function(request,response,next){
  if (request.user){
    next();
  }
  else{
    response.redirect("/")
  }
}


app.use(cookieSession({
 name: 'Sistema',
 keys: [process.env.KEY1, process.env.KEY2]
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

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
  var contenido = fs.readFileSync(__dirname + "/cliente/index.html", 'utf8');
  contenido = contenido.replace(
    '%%GOOGLE_CLIENT_ID%%', 
    process.env.GOOGLE_CLIENT_ID
  );
  contenido = contenido.replace(
    '%%GOOGLE_ONETAP_CALLBACK%%', 
    process.env.BASE_URL + '/oneTap/callback'
  );
  response.setHeader("Content-type", "text/html");
  response.send(contenido);
});

app.get("/agregarUsuario/:nick",function(request,response){
    let nick=request.params.nick;
    let res=sistema.agregarUsuario(nick);
    response.json(res);
});

app.get("/obtenerUsuarios",haIniciado,function(request,response){
  let lista=sistema.obtenerUsuarios();
  response.send(lista);
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


app.post('/loginUsuario',
  passport.authenticate("local", {
    failureRedirect: "/fallo" // Redirige a /fallo si la autenticación falla
  }),
  function(req, res) {
    // Si la autenticación es exitosa, redirige a /ok
    res.redirect("/ok");
  }
);

app.get("/ok", function(request, response) {
  // Passport guarda el usuario en request.user
  // Enviamos el email como 'nick' al cliente
  response.send({ nick: request.user.email }); 
});
app.get("/confirmarUsuario/:email/:key", function(request, response) {
    let email = request.params.email;
    let key = request.params.key;
    
    sistema.confirmarUsuario({ "email": email, "key": key }, function(usr) {
        if (usr.email != -1) {
            // Si la confirmación es exitosa, creamos la cookie e iniciamos sesión
            response.cookie('nick', usr.email); 
            response.redirect('/');
        } else {
            // Aquí podrías redirigir a una página de error
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

app.post("/registrarUsuario",function(request,response){
  sistema.registrarUsuario(request.body,function(res){
  response.send({"nick":res.email});
  });
});


//node index.js
//probando