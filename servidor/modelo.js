const datos=require("./cad.js");
const correo = require("./email.js");
const bcrypt = require('bcrypt');

function Sistema(test){
  this.usuarios = {};
  this.cad=new datos.CAD();
 
  if(!test.test){
    this.cad.conectar(function(db){
      console.log("Conectado a Mango Atlas");});
      //Aqui puedes realizar operaciones con la base de datos
  }

  this.agregarUsuario = function(nick){
    let res={"nick":-1};
    if (!this.usuarios[nick]){
      this.usuarios[nick]=new Usuario(nick);
      res.nick=nick;
    }
    else{
      console.log("el nick "+nick+" está en uso");
    }
    return res;
  };
  this.obtenerUsuarios = function(){   
    return this.usuarios;
  };
  this.usuarioActivo = function(nick){
    return this.usuarios.hasOwnProperty(nick);
  };
  this.eliminarUsuario = function(nick){
    if(this.usuarioActivo(nick)){
        delete this.usuarios[nick];
        return true;
    }else{
        return false;
    }
  };
  this.numeroUsuarios = function(){
    return Object.keys(this.usuarios).length;
  };
  this.usuarioGoogle=function(usr,callback){
    this.cad.buscarOCrearUsuario(usr,function(obj){
    callback(obj);
  });
  };
  this.registrarUsuario=function(obj,callback){
    let modelo=this;
    if (!obj.nick){
     obj.nick=obj.email;
    }
    this.cad.buscarUsuario({ "email": obj.email }, async function(usr){
    if (!usr){
      obj.key = Date.now().toString();
      obj.confirmada = false;
      obj.password = await bcrypt.hash(obj.password, 10); 
      modelo.cad.insertarUsuario(obj, function(res) {
          correo.enviarEmail(obj.email, obj.key, "Confirma cuenta");
          callback(res);
      });
    }
    else
    {
      callback({"email":-1});
    }
    });
};
this.confirmarUsuario = function(obj, callback) {
    let modelo = this;
    // Buscamos al usuario con el email, la key y que NO esté confirmada [cite: 768-769]
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": false, "key": obj.key }, function(usr) {
        if (usr) {
            // Si lo encontramos, lo marcamos como confirmado
            usr.confirmada = true; // [cite: 771]
            // Y llamamos a la CAD para actualizarlo en la BBDD
            modelo.cad.actualizarUsuario(usr, function(res) {
                callback({ "email": res.email }); // [cite: 773]
            });
        } else {
            callback({ "email": -1 }); // [cite: 778]
        }
    });
};

this.loginUsuario = function(obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": true }, function(usr) {
        if (!usr) {
            // Usuario no encontrado o no confirmado
            callback(undefined);
            return -1;
        }
        
        bcrypt.compare(obj.password, usr.password, function(err, result) {
            if (result) {
                // Contraseña correcta
                callback(usr);
            } else {
                // Contraseña incorrecta
                callback(undefined);
            }
        });
    });
};
}

function Usuario(nick){
  this.nick = nick;
}


module.exports.Sistema = Sistema;