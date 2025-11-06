const datos=require("./cad.js");

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
    this.cad.buscarUsuario(obj,function(usr){
    if (!usr){
      modelo.cad.insertarUsuario(obj,function(res){
      callback(res);
    });
    }
    else
    {
    callback({"email":-1});
    }
    });
};

}

function Usuario(nick){
  this.nick = nick;
}


module.exports.Sistema = Sistema;