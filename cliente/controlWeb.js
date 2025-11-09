function ControlWeb() {
  this.pintarMenu = function(nick) {
    const $menu = $("#menu"); // <ul id="menu"> en index.html
    if (nick) {
      $menu.html(`
        <li class="nav-item"><a class="nav-link" href="#home">Inicio</a></li>
        <li class="nav-item"><a class="nav-link" href="#link2">Link 2</a></li>
        <li class="nav-item"><a id="lnkSalir" class="nav-link" href="#">Salir</a></li>
      `);
    } else {
      $menu.html(`
        <li class="nav-item"><a class="nav-link" href="#login">Inicio sesión</a></li>
        <li class="nav-item"><a class="nav-link" href="#link2">Link 2</a></li>
        <li class="nav-item disabled"><a class="nav-link" href="#" tabindex="-1" aria-disabled="true">Salir</a></li>
      `);
    }
  };
  this.mostrarAgregarUsuario = function(){
    $('#bnv').remove();
    $('#mAU').remove();
    let cadena = '<div id="mAU">';
    cadena = cadena + '<div class="card"><div class="card-body">';
    cadena = cadena + '<div class="form-group">';
    cadena = cadena + '<label for="nick">Nick:</label>';
    cadena = cadena + '<p><input type="text" class="form-control" id="nick" placeholder="introduce un nick"></p>';
    cadena = cadena + '<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
    // Botón “Acceso con Google” igual que en el guion
    cadena = cadena + '<div><a href="/auth/google"><img src="/cliente/img/web_light_rd_SI@1x.png" style="height:40px;"></a></div>';
    cadena = cadena + '</div>';
    cadena = cadena + '</div></div></div>';

    // Inyectamos en el contenedor
    $('#au').empty().append(cadena);

    $('#btnAU').on('click', function(){
      var nick = $('#nick').val().trim();
      if (!nick){ alert('Escribe un nick'); return; }
      rest.agregarUsuario(nick);
  });
};
  this.mostrarRegistro=function(){
  $("#fmRegistro").remove();
  $("#fmLogin").remove();
  $("#registro").load("./cliente/registro.html",function(){
    $("#btnRegistro").on("click",function(e){
      e.preventDefault();
      let email=$("#email").val();
      let pwd=$("#pwd").val();
      if (email && pwd){
        $(this).prop("disabled", true).text("Registrando...");
        rest.registrarUsuario(email,pwd);
        console.log(email+" "+pwd);
      }
      });
    $("#registro").append('<p>¿Ya tienes cuenta? <a href="#" id="linkLogin">Inicia sesión</a></p>');
      $("#linkLogin").on("click", function(e){
        e.preventDefault();
        cw.mostrarLogin();
      });
    });
  };

  this.mostrarLogin = function() {
    $("#fmLogin").remove();
    // Limpiamos el div de registro si estuviera
    $("#fmRegistro").remove(); 
    
    $("#registro").load("./cliente/login.html", function() {
      // Deshabilitar botón al enviar
      $("#btnLogin").off("click").on("click", function(e) {
        e.preventDefault();
        let email = $("#email").val();
        let pwd = $("#pwd").val();
        if (email && pwd) {
          // Deshabilitamos botón
          $(this).prop("disabled", true).text("Iniciando sesión...");
          rest.loginUsuario(email, pwd);
        }
      });
      $("#registro").append('<p>¿No tienes cuenta? <a href="#" id="linkRegistro">Regístrate aquí</a></p>');
      $("#linkRegistro").on("click", function(e){
        e.preventDefault();
        cw.mostrarRegistro();
      });
    });
  };

  this.comprobarSesion=function(){
    const nick = $.cookie('nick');
    this.pintarMenu(nick);
    $('#au').empty();
    if (nick){
      this.mostrarMensaje("Bienvenido al sistema, "+ nick);
    }
    else{
      this.mostrarLogin();
    }
  };

   this.mostrarMensaje = function (msg) {
    $('#msg').empty();
    const html = `
      <div class="alert alert-info" role="alert">
        ${msg}
      </div>
    `;
    $('#msg').html(html);
    setTimeout(() => $('#msg').empty(), 3000);
  };

  this.salir = function () {
    //const nick = $.cookie('nick') || localStorage.getItem('nick'); // fallback opcional
    const nick = $.cookie('nick');
    // borrar sesión
    $.removeCookie("nick");
    rest.cerrarSesion();
    // actualizar UI + despedida y recarga
    cw.mostrarMensaje(`¡Hasta luego${nick ? ', ' + nick : ''}!`);
    setTimeout(() => location.reload(), 1200);
  };
  this.limpiar = function() {
    $('#au').empty(); // Contenedor de "agregar usuario" / mensajes
    $('#registro').empty(); // Contenedor del formulario de registro
  };
}
