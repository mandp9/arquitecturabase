function ClienteRest(){
this.agregarUsuario = function(nick) {
  $.getJSON("/agregarUsuario/" + nick, function(data) {
    if (data.nick != -1) {
      console.log("Usuario " + nick + " ha sido registrado");
      const msg = "Bienvenido al sistema, " + nick;
      $.cookie("nick", nick, { path: '/' });
      cw.comprobarSesion();
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
      dataType: 'json',               
      success: function (data) {
        if (data.nick != -1) {
          console.log('Usuario ' + nick + ' ha sido registrado');
        } else {
          console.log('El nick ya está ocupado');
        }
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('Status: ' + textStatus);
        console.log('Error: ' + errorThrown);
      }
    });
  };

  this.obtenerUsuarios = function () {
    return $.ajax({
      type: 'GET',
      url: '/obtenerUsuarios',
      dataType: 'json'
    }).done(function (data) {
      console.log('Usuarios:', data);
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
      cw.mostrarMensaje("Usuario " + data.nick + " registrado. Por favor, inicia sesión.");
      cw.mostrarLogin();
      }
      else{
        console.log("Hay un usuario registrado con ese email");
        cw.mostrarModal("No se ha podido registrar el usuario");
        $("#btnRegistro").prop("disabled", false).text("Registrar");
      }
      },
      error:function(xhr, textStatus, errorThrown){
      console.log("Status: " + textStatus);
      console.log("Error: " + errorThrown);
      cw.mostrarMensaje("Error de conexión al registrar. Inténtalo de nuevo.");
      $("#btnRegistro").prop("disabled", false).text("Registrar");
      },
      contentType:'application/json'
      });
  };
  this.loginUsuario = function(email, password) {
    $.ajax({
      type: 'POST',
      url: '/loginUsuario', 
      data: JSON.stringify({ "email": email, "password": password }),
      success: function(data) {
        if (data.nick != "nook") {
          console.log("Usuario " + data.nick + " ha iniciado sesión");
          $.cookie("nick", data.nick);
          cw.limpiar();
          cw.comprobarSesion(); 
        } else {
          console.log("Datos incorrectos. No se pudo iniciar sesión");
          cw.mostrarModal("Error: Email o contraseña incorrectos.");
          $("#btnLogin").prop("disabled", false).text("Iniciar sesión");
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        console.log("Status: " + textStatus);
        cw.mostrarMensaje("Error de conexión al iniciar sesión.");
        $("#btnLogin").prop("disabled", false).text("Iniciar sesión");
      },
      contentType: 'application/json'
    });
  };

  this.cerrarSesion = function(){
    $.getJSON("/cerrarSesion", function(){
        console.log("Sesion cerrada."); 
        $.removeCookie("nick");
    }).fail(function(xhr, status, err) {
        console.error("Error al notificar cierre de sesión:", status, err);
    });
};

  
}
