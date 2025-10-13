function ClienteRest(){
this.agregarUsuario=function(nick){
var cli=this;
$.getJSON("/agregarUsuario/"+nick,function(data){
if (data.nick!=-1){
console.log("Usuario "+nick+" ha sido registrado")
}
else{
console.log("El nick ya está ocupado");
}
})
};
this.agregarUsuario2 = function (nick) {
    $.ajax({
      type: 'GET',
      url: '/agregarUsuario/' + encodeURIComponent(nick),
      dataType: 'json',               // esperamos JSON de respuesta
      // contentType no es necesario en GET sin body
      success: function (data) {
        if (data.nick != -1) {
          console.log('Usuario ' + nick + ' ha sido registrado');
        } else {
          console.log('El nick ya está ocupado');
        }
        // opcional: logSalida('agregarUsuario2', data);
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('Status: ' + textStatus);
        console.log('Error: ' + errorThrown);
      }
    });
  };

  // Si quieres, añade el resto con $.ajax también:
  this.obtenerUsuarios = function () {
    return $.ajax({
      type: 'GET',
      url: '/obtenerUsuarios',
      dataType: 'json'
    }).done(function (data) {
      console.log('Usuarios:', data);
      // logSalida('obtenerUsuarios', data);
    }).fail(function (xhr, s, e) {
      console.log('Error obtenerUsuarios:', s, e);
    });
  };

  this.usuarioActivo = function (nick) {
    return $.ajax({
      type: 'GET',
      url: '/usuarioActivo/' + encodeURIComponent(nick),
      dataType: 'json'
    }).done(function (data) {
      console.log('Activo:', data);
    });
  };

  this.numeroUsuarios = function () {
    return $.ajax({
      type: 'GET',
      url: '/numeroUsuarios',
      dataType: 'json'
    }).done(function (data) {
      console.log('Num:', data);
    });
  };

  this.eliminarUsuario = function (nick) {
    return $.ajax({
      type: 'GET',
      url: '/eliminarUsuario/' + encodeURIComponent(nick),
      dataType: 'json'
    }).done(function (data) {
      console.log('Eliminado:', data);
    });
  };
}
