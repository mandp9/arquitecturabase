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
    $("#fmRegistro").remove(); 
    
    $("#registro").load("./cliente/login.html", function() {
      $("#btnLogin").off("click").on("click", function(e) {
        e.preventDefault();
        let email = $("#email").val();
        let pwd = $("#pwd").val();
        if (email && pwd) {
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
      rest.comprobarPartidaActiva();
      this.mostrarMensaje("Bienvenido al sistema, " + nick, true);
      this.mostrarHome();
    }
    else{
      this.mostrarLogin();
    }
  };

   this.mostrarMensaje = function (msg, noOcultar) {
    $('#msg').empty();
    const html = `
      <div class="alert alert-info" role="alert">
        ${msg}
      </div>
    `;
    $('#msg').html(html);
    if (!noOcultar) {
        setTimeout(() => $('#msg').empty(), 3000);
    }
  };

  this.salir = function () {
    const nick = $.cookie('nick');
    $.removeCookie("nick");
    rest.cerrarSesion();
    cw.mostrarMensaje(`¡Hasta luego${nick ? ', ' + nick : ''}!`);
    setTimeout(() => location.reload(), 1200);
  };
  this.limpiar = function() {
    $('#au').empty(); 
    $('#registro').empty(); 
    $('#msg').empty();
  };
  this.mostrarModal = function(msg) {
    $("#mModalMsg").remove(); 
    let cadena = "<div id='mModalMsg'>" + msg + "</div>";
    $('#mBody').append(cadena);
    $('#miModal').modal();
  };
  this.mostrarHome = function() {
        $('body').css('background-image', 'none');
        this.limpiar();
        let nick = $.cookie("nick");
        let cadena = `
        <div class="row">
            <div class="col-md-12 text-center">
                <h3>Bienvenido, ${nick}</h3>
                
                <div class="d-flex justify-content-center gap-2 mt-3">
                    <button id="btnCrearPartida" class="btn btn-primary btn-lg mr-2">Crear Nueva Partida</button>
                    <button id="btnSalir" class="btn btn-outline-danger btn-lg">Cerrar Sesión</button>
                </div>
            </div>
        </div>
        
        <div class="row mt-5">
            <div class="col-md-6 offset-md-3">
                <h4>Partidas Disponibles</h4>
                <div id="listaPartidas" class="list-group">
                    <li class="list-group-item text-muted">Buscando partidas...</li>
                </div>
            </div>
        </div>
        `;
        
        $('#au').append(cadena);

        $('#btnCrearPartida').on('click', function() {
            $(this).prop('disabled', true);
            ws.crearPartida();
        });

        $('#btnSalir').on('click', function() {
            cw.salir();
        });
    };
    this.mostrarPartida = function(datos) {
        let codigoStr = datos.codigo || datos;
        let propietario = datos.propietario;
        let nick = $.cookie("nick");

        this.limpiar();
        $('body').css({
          'background-image': 'url("./cliente/img/gifCarga.gif")',
          'background-size': 'cover',
          'background-position': 'center',
          'background-attachment': 'fixed'
        });
        let cadena = `
        <div class="text-center">
            <h2 class="mb-4">Sala de Espera: <span class="text-primary">${codigoStr}</span></h2>
            
            <div class="card p-4 mb-4" style="max-width: 500px; margin: 0 auto;">
                <h4>Jugadores Conectados</h4>
                <div id="listaJugadoresSala" class="list-group mb-3">
                    <li class="list-group-item">Esperando...</li>
                </div>
                
                <div id="tituloEstado" class="alert alert-info">Esperando rival...</div>
                
                <button id="btnIrAlJuego" class="btn btn-success btn-lg btn-block" style="display:none;">
                    ⚔️ ¡IR AL JUEGO!
                </button>
            </div>
            
            <div id="zonaBotones"></div> 
        </div>`;
        $('#au').append(cadena);
        let botones = "";

        if (nick === propietario) {
        botones = `
          <div class="alert alert-warning small mt-2">Eres el creador de la sala.</div>
          <button id="btnEliminarPartida" class="btn btn-danger btn-lg mt-2">
              ⚠️ Eliminar Sala
          </button>`;
        } else {
          botones = `
          <button id="btnSalirPartida" class="btn btn-secondary btn-lg mt-2">
              Abandonar Sala
          </button>`;
        }

        $('#zonaBotones').append(botones);
        
        $('#btnSalirPartida').on('click', function() {
            ws.abandonarPartida(codigoStr);
            cw.mostrarHome();
        });
        $('#btnEliminarPartida').on('click', function() {
          if(confirm("¿Seguro que quieres cerrar la sala?")) {
              ws.eliminarPartida(codigoStr); // Llama a la nueva función
          }
        });

        $('#btnIrAlJuego').on('click', function() {
            cw.mostrarTablero(codigoStr);
        });
    };
    
    this.actualizarListaPartidas = function(lista) {
      if ($('#listaPartidas').length === 0) return;

        $('#listaPartidas').empty();

        if (lista.length === 0) {
            $('#listaPartidas').append('<li class="list-group-item">No hay partidas disponibles</li>');
        } else {
            lista.forEach(partida => {
                let item = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Código:</strong> ${partida.codigo} 
                        <small class="text-muted ml-2">(Creador: ${partida.propietario})</small>
                    </div>
                    <button class="btn btn-success btn-sm btnUnirse" data-codigo="${partida.codigo}">Unirse</button>
                </li>`;
                $('#listaPartidas').append(item);
            });

            $('.btnUnirse').off('click').on('click', function() {
                let codigo = $(this).data('codigo');
                ws.unirAPartida(codigo);
            });
        }
    };
    this.actualizarEstadoPartida = function(datos) {
        if ($('#listaJugadoresSala').length === 0) return;
        let jugadoresValidos = datos.jugadores.filter(jugador => jugador);
        let numJugadores = datos.jugadores.length;
        let max = datos.maxJug || 2;
        
        $('#listaJugadoresSala').empty();

        datos.jugadores.forEach(jugador => {
            $('#listaJugadoresSala').append(`<li class="list-group-item">${jugador}</li>`);
        });
        for (let i = jugadoresValidos.length; i < max; i++) {
          $('#listaJugadoresSala').append(`<li class="list-group-item text-muted">Esperando jugador...</li>`);
        }
        if (numJugadores === max) {
            $('#tituloEstado').removeClass('alert-info').addClass('alert-success').text("¡Sala llena! Todo listo.");
            $('#btnIrAlJuego').show();
        } else {
            let mensaje = datos.mensaje || "Esperando rival..."; // Usa el mensaje del servidor
            $('#tituloEstado').removeClass('alert-success').addClass('alert-info').text(mensaje);
            $('#btnIrAlJuego').hide();
        }
    };
    this.mostrarAviso = function(msg) {
      $('#tituloEstado').removeClass('alert-info').addClass('alert-success').text(msg);
    };

}
