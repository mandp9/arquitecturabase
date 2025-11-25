const datos=require("./cad.js");
const correo = require("./email.js");
const bcrypt = require('bcrypt');

function Sistema(test){
  this.usuarios = {};
  this.partidas = {};
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
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": false, "key": obj.key }, function(usr) {
        if (usr) {
            usr.confirmada = true; 
            modelo.cad.actualizarUsuario(usr, function(res) {
                callback({ "email": res.email }); 
            });
        } else {
            callback({ "email": -1 }); 
        }
    });
};

this.loginUsuario = function(obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": true }, function(usr) {
        if (!usr) {
            callback(undefined);
            return -1;
        }
        
        bcrypt.compare(obj.password, usr.password, function(err, result) {
            if (result) {
                callback(usr);
            } else {
                callback(undefined);
            }
        });
    });
};
this.crearPartida = function(email) {
        let codigo = this.obtenerCodigo();
        let partida = new Partida(codigo, email);
        partida.agregarJugador(email);
        this.partidas[codigo] = partida;
        return { codigo: codigo };
    };
this.unirAPartida = function(email, codigo) {
        let partida = this.partidas[codigo];
        if (partida && partida.estado === "abierta") {
            partida.agregarJugador(email);
            return { codigo: codigo, estado: partida.estado };
        } else {
            return { codigo: -1 };
        }
  };
  this.obtenerPartidasDisponibles = function() {
        let lista = [];
        for (let key in this.partidas) {
            let partida = this.partidas[key];
            if (partida.estado === "abierta") {
                lista.push({ codigo: partida.codigo, propietario: partida.propietario });
            }
        }
        return lista;
  };
  this.obtenerCodigo = function() {
        let cadena = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let nombre = "";
        for (let i = 0; i < 6; i++) {
            nombre += cadena.charAt(Math.floor(Math.random() * cadena.length));
        }
        return nombre;
  };
  this.abandonarPartida = function(email, codigo) {
    if (this.partidas[codigo]) {
        let partida = this.partidas[codigo];
        
        if (partida.estado === "abierta" && partida.propietario === email) {
            delete this.partidas[codigo];
            return { codigo: codigo, eliminado: true };
        }
    }
    return { codigo: -1 };
};
}

function Usuario(nick){
  this.nick = nick;
}

function Partida(codigo, propietario) {
    this.codigo = codigo;
    this.propietario = propietario;
    this.jugadores = [];
    this.maxJug = 2;
    this.estado = "abierta"; // "abierta", "completa", "terminada"

    this.agregarJugador = function(nick) {
        if (this.jugadores.length < this.maxJug) {
            this.jugadores.push(nick);
            if (this.jugadores.length === this.maxJug) {
                this.estado = "completa";
            }
            return true;
        }
        return false;
    }
}



module.exports.Sistema = Sistema;
