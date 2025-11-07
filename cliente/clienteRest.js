function ClienteRest(){
this.agregarUsuario = function(nick) {
  $.getJSON("/agregarUsuario/" + nick, function(data) {
    if (data.nick != -1) {
      console.log("Usuario " + nick + " ha sido registrado");
      const msg = "Bienvenido al sistema, " + nick;
      $.cookie("nick", nick, { path: '/' });
      cw.mostrarMensaje(msg);
      cw.pintarMenu($.cookie('nick'));
    } else {
      console.log("El nick ya está ocupado");
      $.removeCookie("nick");
      cw.mostrarMensaje("El nick " + nick + " está ocupado. Elige otro nombre.");
      setTimeout(() => cw.mostrarAgregarUsuario(), 1500);
    }
  }).fail(function(xhr, status, err) {
    console.error("Error en agregarUsuario:", status, err);
    alert("Error al conectar con el servidor");
  });
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
  this.registrarUsuario=function(email,password){
  $.ajax({
      type:'POST',
      url:'/registrarUsuario',
      data: JSON.stringify({"email":email,"password":password}),
      success:function(data){
      if (data.nick!=-1){
      console.log("Usuario "+data.nick+" ha sido registrado");
      $.cookie("nick",data.nick,{ path: '/' });
      cw.limpiar();
      cw.mostrarMensaje("Bienvenido al sistema, "+data.nick);
      //cw.mostrarLogin();
      }
      else{
      console.log("El nick está ocupado");
      }
      },
      error:function(xhr, textStatus, errorThrown){
      console.log("Status: " + textStatus);
      console.log("Error: " + errorThrown);
      },
      contentType:'application/json'
      });
  };
  this.cerrarSesion = function(){
    $.getJSON("/cerrarSesion", function(){
        // Opcional: El servidor debería manejar el logout de Passport y la redirección
        // En este callback podemos confirmar que el proceso terminó
        console.log("Sesión de servidor notificada."); 
    }).fail(function(xhr, status, err) {
        console.error("Error al notificar cierre de sesión:", status, err);
    });
};

  
}
