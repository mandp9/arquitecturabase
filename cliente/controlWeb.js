function ControlWeb() {
    this.jugadoresActuales = [];
    this.intervaloTiempo = null;

    this.reproducirAudio = function(idElemento) {
        let audio = document.getElementById(idElemento);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {}); 
        }
    };
    this.reproducirSonidoBoton = function() {
        this.reproducirAudio("audioHoverBtn");
    };

    this.limpiarId = function(nick) {
        return nick.replace(/[^a-zA-Z0-9]/g, '_'); 
    };

    this.pintarMenu = function(nick) {
        const $menu = $("#menu"); 
        if (nick) {
            $menu.html(`
                <li class="nav-item">
                    <a id="lnkSalir" class="nav-link btn-salir-medieval" href="#">
                        🚪 Salir
                    </a>
                </li>
            `);
            $('#lnkSalir').on('mouseenter', () => this.reproducirSonidoBoton());
        } else {
            $menu.html(``);
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
        cadena = cadena + '<div><a href="/auth/google"><img src="/cliente/img/web_light_rd_SI@1x.png" style="height:40px;"></a></div>';
        cadena = cadena + '</div>';
        cadena = cadena + '</div></div></div>';

        $('#au').empty().append(cadena);

        $('#btnAU').on('click', function(){
            var nick = $('#nick').val().trim();
            if (!nick){ alert('Escribe un nick'); return; }
            rest.agregarUsuario(nick);
        });
    };

    this.mostrarRegistro=function(){
        $('body').css('background-image', 'none');
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
        $('body').css({
            'background-image': 'url("./cliente/img/dragon.gif")',
            'background-size': 'cover',
            'background-position': 'center',
            'background-attachment': 'fixed'
        });
        $("#fmLogin").remove();
        $("#fmRegistro").remove(); 
        $('#gameTitle').show();

        $("#registro").load("./cliente/login.html", function() {
            $("#email, #pwd").css({
                "background-color": "rgba(0, 0, 0, 0.5)", 
                "color": "white",                         
                "border": "1px solid rgba(255, 255, 255, 0.5)", 
                "backdrop-filter": "blur(5px)",            
                "border-radius": "5px"
            });
            $("#btnLogin").off("click").on("click", function(e) {
                e.preventDefault();
                let email = $("#email").val();
                let pwd = $("#pwd").val();
                if (email && pwd) {
                    $(this).prop("disabled", true).text("Iniciando sesión...");
                    rest.loginUsuario(email, pwd);
                }
            });
            $("#registro").append(
                '<p style="color: #ffffffff; font-weight: bold;">¿No tienes cuenta? ' + 
                '<a href="#" id="linkRegistro" style="color: #edf345ff; text-decoration: underline;">Regístrate aquí</a>' +
                '</p></div>'
            );      
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
        } else {
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
        let audioJuego = document.getElementById("audioJuego");
        if (audioJuego) { audioJuego.pause(); audioJuego.currentTime = 0;}
        $('body').css({
            'background-image': 'url("./cliente/img/casss.png")',
            'background-size': 'cover',
            'background-position': 'center',
            'background-attachment': 'fixed'
        });
        this.limpiar();
        $('#contenedor-pocima').hide();
        let nick = $.cookie("nick");
        $('#gameTitle').show();
        
        this.ultimasPartidas = [];

        rest.obtenerUsuario(nick, function(datosUsuario) {
        let monedasTotales = datosUsuario.monedas || 0; 

        let cadena = `
            <div class="row justify-content-center" style="min-height: 80vh; align-items: flex-start; padding-top: 50px;">
                <div class="col-12 col-md-8 col-lg-7 text-center">
                    
                    <h2 class="mb-4 animate__animated animate__fadeInDown" 
                        style="font-family: 'MedievalSharp', cursive; 
                               color: #fdf6e3; 
                               text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 15px #8b4513; 
                               font-size: 2.5rem;">
                        ¡Saludos, <span style="color: #FFD700;">${nick}</span>!
                    </h2>

                    <div class="mb-4 animate__animated animate__fadeInDown" 
                         style="display: inline-block; background: rgba(0,0,0,0.6); padding: 10px 20px; border-radius: 20px; border: 2px solid #FFD700;">
                        <span style="font-size: 1.5rem; color: #fdf6e3;">✧˖° Tesoro Acumulado: </span>
                        <span style="font-size: 1.8rem; color: #FFD700; font-weight: bold;">${monedasTotales} ⚜️</span>
                    </div>

                    <div class="mb-5 animate__animated animate__fadeInUp d-flex justify-content-center gap-3">
                        <button id="btnCrearPartida" class="btn btn-lg px-4 py-3 shadow-lg mr-3" 
                                style="font-family: 'MedievalSharp', cursive; background-color: #8b4513; color: #fdf6e3; border: 3px solid #5d4037; border-radius: 10px;">
                            ⚔️ Crear Nueva Misión
                        </button>
                        <button id="btnSalir" class="btn btn-lg px-4 py-3 shadow-lg" 
                                style="font-family: 'MedievalSharp', cursive; background-color: #5d4037; color: #fdf6e3; border: 3px solid #3e2723; border-radius: 10px;">
                            🚪 Cerrar Sesión
                        </button>
                    </div>

                    <div class="card shadow animate__animated animate__fadeInUp animate__delay-1s mx-auto" 
                         style="max-width: 600px;
                                background-color: #fdf6e3; 
                                border: 4px solid #8b4513; 
                                border-radius: 15px;
                                box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                        
                        <div class="card-body p-4">
                            <h4 class="text-center mb-3" style="font-family: 'MedievalSharp', cursive; color: #3e2723; border-bottom: 2px dashed #8b4513; padding-bottom: 10px;">
                                📜 Tablón de Misiones
                            </h4>
                            
                            <div class="input-group mb-3 shadow-sm">
                                <div class="input-group-prepend">
                                    <span class="input-group-text" style="background-color: #8b4513; color: #fdf6e3; border: 1px solid #5d4037;">🔎</span>
                                </div>
                                <input type="text" id="buscador" class="form-control" placeholder="Buscar código de misión..." 
                                       style="background: rgba(255,255,255,0.7); border: 1px solid #8b4513; color: #3e2723; font-family: 'MedievalSharp', cursive;">
                            </div>

                            <div id="listaPartidas" class="list-group text-left" style="max-height: 300px; overflow-y: auto;">
                                <li class="list-group-item text-center text-muted" style="background-color: transparent; border-bottom: 1px dashed #8b4513; font-family: 'MedievalSharp', cursive;">
                                    Buscando misiones activas...
                                </li>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            `;
        
        $('#au').append(cadena);
        rest.obtenerPartidasDisponibles();

        $('#btnCrearPartida, #btnSalir').on('mouseenter', () => cw.reproducirSonidoBoton());

        $('#btnCrearPartida, #btnSalir').on('mouseenter', function() {
                playSound();
        });

        $('#btnCrearPartida').on('click', function() {
            $(this).prop('disabled', true);
            ws.crearPartida();
        });

        $('#btnSalir').on('click', function() {
            cw.salir();
        });

        $('#buscador').on('keyup', function() {
            cw.actualizarListaPartidas(cw.ultimasPartidas); 
        });

        $('#btnBuscar').on('click', function() {
            cw.actualizarListaPartidas(cw.ultimasPartidas); 
        });
        });
    };

    this.mostrarPartida = function(datos) {
        let codigoStr = datos.codigo || datos;
        let propietario = datos.propietario;
        let nick = $.cookie("nick");

        this.limpiar();
        $('#gameTitle').hide();
        
        $('.navbar').css('z-index', '10000');

        $('body').css({
          'background-image': 'url("./cliente/img/gifCarga.gif")',
            'background-size': 'cover',
            'background-position': 'center',
            'background-attachment': 'fixed',
            'overflow': 'hidden',
            'overflow': 'auto'
        });
        let cadena = `
        <div style="
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            z-index: 9999;
            font-family: 'MedievalSharp', cursive; 
        ">
            <audio id="audioLobby" loop>
                <source src="./cliente/musica/lobby.mp3" type="audio/mpeg">
            </audio>

            <div id="btnAudio" class="btn btn-sm shadow-sm" 
                 style="position: absolute; top: 120px; right: 15px; border-radius: 50%; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; border: 1px solid #FFD700; color: #FFD700; cursor: pointer; background: rgba(0,0,0,0.5);">
                🔊
            </div>

            <h2 class="mb-4 text-white" style="text-shadow: 2px 2px 4px #000; font-weight: bold; z-index: 10;">
                Sala de Espera: <span class="text-warning" style="text-shadow: 2px 2px 8px rgba(255,193,7,0.6);">${codigoStr}</span>
            </h2>
            
            <div class="card p-4 mb-4 shadow-lg" 
                 style="
                    width: 90%; 
                    max-width: 500px; 
                    position: relative;
                    background-color: rgba(52, 52, 48, 0.6); 
                    backdrop-filter: blur(1px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 4px double #FFD700;
                    border-radius: 15px;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                    color: white;
                 ">
                
                <h4 class="text-center mb-3 font-weight-bold" style="color: #ffffffff; text-shadow: 2px 2px 0 #000;">
                    Jugadores
                </h4>                
                <div id="listaJugadoresSala" class="list-group mb-3 font-weight-bold shadow-sm" style="min-height: 50px;">
                </div>
                
                <div id="tituloEstado" class="alert alert-info text-center font-weight-bold shadow-sm" style="background-color: rgba(23, 162, 184, 0.8); color: white; border: none;">
                    Esperando rival...
                </div>
                
                <button id="btnIrAlJuego" class="btn btn-warning btn-lg btn-block shadow font-weight-bold text-white" 
                        style="display:none; border: 2px solid white;">
                    ⚔️ ¡A LA BATALLA!
                </button>
            </div>
            
            <div id="zonaBotones" style="width: 100%; max-width: 500px; text-align: center;"></div> 
        </div>`;
        
        $('#au').append(cadena);
        
        let audio = document.getElementById("audioLobby");
        audio.play().catch(function(error) {
            console.log("El navegador bloqueó el autoplay, hay que pulsar el botón.");
            $('#btnAudio').text("🔇");
        });
        $('#btnAudio').on('click', function() {
            if (audio.paused) {
                audio.play();
                $(this).text("🔊"); 
                $(this).removeClass("btn-danger").addClass("btn-light");
            } else {
                audio.pause();
                $(this).text("🔇"); 
                $(this).removeClass("btn-light").addClass("btn-danger");
            }
        });
        let botones = "";

        if (nick === propietario) {
        botones = `
            <div class="alert mt-3 shadow" 
                 style="
                    background-color: rgba(60, 40, 10, 0.9); 
                    color: #FFD700;                          
                    border: 2px solid #FFD700;               
                    font-family: 'MedievalSharp', cursive;   
                    font-size: 1.2rem;
                    text-shadow: 2px 2px 0px #000;           
                    text-transform: uppercase;              
                    letter-spacing: 1px;
                 ">
                 👑 Eres el Señor de la Sala 👑
            </div>

            <button id="btnEliminarPartida" class="btn btn-danger btn-lg mt-2 shadow" 
                    style="
                        font-family: 'MedievalSharp', cursive; 
                        border: 2px solid #800000; 
                        background-color: #b30000;
                    ">
                📜🪶 Disolver equipo
            </button>`;
        } else {
          botones = `
          <button id="btnSalirPartida" class="btn btn-secondary btn-lg mt-2">
              Abandonar Sala 🧙‍♂️
          </button>`;
        }

        $('#zonaBotones').append(botones);
        $('#btnEliminarPartida, #btnSalirPartida').on('mouseenter', () => cw.reproducirSonidoBoton());
        $('#btnIrAlJuego').on('mouseenter', () => cw.reproducirSonidoBoton());

        $('#btnSalirPartida').on('click', function() {
            $('.navbar').css('z-index', '');
            ws.abandonarPartida(codigoStr);
            cw.mostrarHome();
        });
        $('#btnEliminarPartida').on('click', function() {
          if(confirm("¿Seguro que quieres cerrar la sala?")) {
              ws.eliminarPartida(codigoStr); 
          }
        });

        $('#btnIrAlJuego').on('click', function() {
            cw.reproducirAudio("audioBarajar");
            $('.navbar').css('z-index', '');
            cw.mostrarTablero(codigoStr);
        });
    };
    
    this.actualizarListaPartidas = function(lista) {
      if (lista) {
            this.ultimasPartidas = lista;
        } else {
            lista = this.ultimasPartidas || []; 
        }

        if ($('#listaPartidas').length === 0) return;
        $('#listaPartidas').empty();

        let textoBusqueda = $('#buscador').val() || ""; 
        textoBusqueda = textoBusqueda.trim().toLowerCase();

        let listaFiltrada = lista.filter(partida => {
            return partida.codigo.toLowerCase().includes(textoBusqueda);
        });

        if (listaFiltrada.length === 0) {
            if (lista.length === 0) {
                $('#listaPartidas').append('<li class="list-group-item">No hay partidas disponibles</li>');
            } else {
                $('#listaPartidas').append('<li class="list-group-item">No hay coincidencias con ese código</li>');
            }
        } else {
            listaFiltrada.forEach(partida => {
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
        this.jugadoresActuales = datos.jugadores;
        let jugadoresValidos = datos.jugadores.filter(jugador => jugador);
        let numJugadores = datos.jugadores.length;
        let max = datos.maxJug || 2;
        
        $('#listaJugadoresSala').empty();

        datos.jugadores.forEach(jugador => {
            $('#listaJugadoresSala').append(`
                <li class="list-group-item" style="color: black; font-weight: bold;">
                    ${jugador}
                </li>
            `);
        });
        if (numJugadores === max) {
            $('#tituloEstado').removeClass('alert-info').addClass('alert-success').text("¡Sala llena! Todo listo.");
            $('#btnIrAlJuego').show();
        } else {
            let mensaje = datos.mensaje || "Esperando rival..."; 
            $('#tituloEstado').removeClass('alert-success').addClass('alert-info').text(mensaje);
            $('#btnIrAlJuego').hide();
        }
    };

    this.mostrarAviso = function(msg) {
      $('#tituloEstado').removeClass('alert-info').addClass('alert-success').text(msg);
    };

    this.mostrarTablero = function(codigo) {
        let nick = $.cookie("nick");
        let miNick = nick;
        ws.codigo = codigo;
        let audioLobby = document.getElementById("audioLobby");
        if (audioLobby) { audioLobby.pause(); audioLobby.currentTime = 0; }
        this.limpiar();
        $('#au').empty(); 
        $('#registro').empty(); 
        $('#msg').empty(); 
        $('#gameTitle').hide(); 
        $('body').css('background-image', 'none'); 
        
        $('#contenedor-pocima').show(); 
        $('#lblPocimas').text("1");
        
        $('.img-pocima').css('filter', ''); 
        $('#contenedor-pocima').css('cursor', '');
        $('.img-pocima').removeClass('pocima-off'); 


        let jug1 = this.jugadoresActuales && this.jugadoresActuales[0] ? this.jugadoresActuales[0] : "Jugador 1";
        let jug2 = this.jugadoresActuales && this.jugadoresActuales[1] ? this.jugadoresActuales[1] : "Jugador 2";

        let idBadge1 = "badge-" + this.limpiarId(jug1);
        let idBadge2 = "badge-" + this.limpiarId(jug2);

        let htmlBadge1 = (jug1 !== miNick) ? `<div class="badge-rival" id="${idBadge1}" style="opacity: 1">💰 <span class="val">0</span></div>` : '';
        let htmlBadge2 = (jug2 !== miNick) ? `<div class="badge-rival" id="${idBadge2}" style="opacity: 1">💰 <span class="val">0</span></div>` : '';
        
        let cadena = `
        <div id="juego" style="position: relative;">
            <div id="btnAudioJuego" class="btn btn-sm shadow-sm" 
                 style="position: absolute; top: 40px; right: -450px; 
                        border-radius: 50%; width: 45px; height: 45px; 
                        display: flex; justify-content: center; align-items: center; 
                        border: 2px solid #FFD700; color: #FFD700; 
                        cursor: pointer; background: rgba(0,0,0,0.6); 
                        z-index: 999; box-shadow: 0 0 10px #FFD700;">
                🔊
            </div>

            <div id="info-turno" class="alert alert-primary text-center" style="font-weight: bold; font-size: 1.2rem; margin: 10px auto; max-width: 800px;">
                Esperando inicio...
            </div>
            <div id="panel-info">
                <div class="info-item">⏳ <span id="tiempo">00:00</span></div>
                <div class="info-item">💰 <span id="mis-monedas">0</span></div>
            </div>
            
            <div class="arena-de-juego">
                <div id="avatar-izq" class="contenedor-avatar" data-nick="${jug1}">
                    ${htmlBadge1}
                    <img src="./cliente/img/k1.png" alt="${jug1}" class="img-avatar">
                    <div class="nombre-avatar">${jug1}</div>
                </div>

                <div id="tablero" class="grid-cartas"></div>

                <div id="avatar-der" class="contenedor-avatar" data-nick="${jug2}">
                    ${htmlBadge2}
                    <img src="./cliente/img/k2.png" alt="${jug2}" class="img-avatar">
                    <div class="nombre-avatar">${jug2}</div>
                </div>
            </div>
        </div>
        `;
        $('#au').html(cadena); 
        let audioJuego = document.getElementById("audioJuego");
        if (audioJuego) {
            audioJuego.volume = 0.4; 
            audioJuego.play().catch(e => {
                $('#btnAudioJuego').text("🔇"); 
            });
        }
        $('#btnAudioJuego').on('click', function() {
            if (audioJuego.paused) {
                audioJuego.play();
                $(this).text("🔊"); 
                $(this).css("background", "rgba(0,0,0,0.5)");
            } else {
                audioJuego.pause();
                $(this).text("🔇"); 
                $(this).css("background", "rgba(255,0,0,0.5)");
            }
        });
        ws.iniciarPartida(codigo);
    };

    this.pintarTablero = function(datos) {
        let mazo = datos.mazo || datos; 
        let turno = datos.turno;
        let fondo = datos.fondo;
        let nick = $.cookie("nick");

        if (turno) {
            this.actualizarTurno(turno);
        }
        if (fondo) {
            $('body').css({
                'background-image': 'url("./cliente/img/fondos/' + fondo + '")',
                'background-size': 'cover',
                'background-position': 'center',
                'background-attachment': 'fixed',
                'overflow': 'auto'
            });
        }
        let tablero = document.getElementById("tablero");
        tablero.innerHTML = ""; 

        mazo.forEach(carta => {
            let elemento = document.createElement("div");
            elemento.className = "carta";
            elemento.id = "carta-" + carta.id; 
            
            elemento.innerHTML = `
                <div class="cara detras"></div>
                <div class="cara frente">
                    <img src="./cliente/img/cartas/${carta.valor}" alt="monstruo">
                </div>
            `;
            
            elemento.onclick = function() {
                ws.voltearCarta(carta.id);
            };
            
            tablero.appendChild(elemento);
        });
    };

    this.actualizarTurno = function(turno) {
        let nick = $.cookie("nick");
        let info = document.getElementById("info-turno");
        let tablero = $('#tablero');

        if (info) {
            if (turno === nick) {
                info.className = "alert alert-success text-center";
                info.innerHTML = " ¡ES TU TURNO, A PELEAR! ";
                tablero.addClass('turno-propio');
            } else {
                info.className = "alert alert-danger text-center";
                info.innerHTML = " Turno de: " + turno;
                tablero.removeClass('turno-propio');
            }
            
        }

        let avIzq = $('#avatar-izq');
        let avDer = $('#avatar-der');

        if (turno === avIzq.data('nick')) {
            avIzq.removeClass('avatar-turno-inactivo').addClass('avatar-turno-activo');
            avDer.removeClass('avatar-turno-activo').addClass('avatar-turno-inactivo');
        } else if (turno === avDer.data('nick')) {
            avDer.removeClass('avatar-turno-inactivo').addClass('avatar-turno-activo');
            avIzq.removeClass('avatar-turno-activo').addClass('avatar-turno-inactivo');
        }
        let imgPocima = $('.img-pocima');
        let cantidad = parseInt($('#lblPocimas').text());

        if (turno === nick && cantidad > 0) {
            imgPocima.removeClass('pocima-off');
            imgPocima.addClass('animate__infinite'); 
        } else {
            imgPocima.addClass('pocima-off');
            imgPocima.removeClass('animate__infinite');
        }

        if (turno === nick) {
            tablero.addClass('turno-propio');
        } else {
            tablero.removeClass('turno-propio');
        }
        this.iniciarTemporizador();
    };

    this.girarCartaVisual = function(id, valor) {
        let el = document.getElementById("carta-" + id);
        if (el) {
            let audio = document.getElementById("audioCarta");
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => {});
            }
            el.classList.add("girada");
            let img = el.querySelector(".frente img");
            if (img) {
                img.src = "./cliente/img/cartas/" + valor;
            }
        }
    };

    this.ocultarCartaVisual = function(id) {
        let el = document.getElementById("carta-" + id);
        if (el) {
            el.classList.remove("girada");
        }
    };
    this.obtenerNombreMonstruo = function(nombreArchivo) {
        const nombres = {
            "enemy1.jpg": "la Jauría de Lobos",
            "enemy2.jpg": "un Enano Feroz",
            "enemy3.jpg": "un Ermitaño Salvaje",
            "enemy4.jpg": "la Gorgona Venenosa",
            "enemy5.jpg": "un Gourmet Caníbal",
            "enemy6.jpg": "un Ciervo Zombie",
            "enemy7.jpg": "un Asesino a sueldo",
            "enemy8.jpg": "una Momia Antigua",
            "enemy9.jpg": "un Hechicero Oscuro",
            "enemy10.jpg": "un Demonio Castigador",
            "enemy11.jpg": "un Zombie errante",
            "enemy12.jpg": "un Zombie gigante",
            "enemy13.jpg": "un Murciélago rabioso",
            "enemy14.jpg": "una Quimera",
            "enemy15.jpg": "una Esfinge",
            "enemy16.jpg": "Cerberus",
            "enemy17.jpg": "un Súcubo",
            "enemy18.jpg": "un unicornio adorable",
            "enemy19.jpg": "un Gatito (¡Cuidado!)",
            "enemy20.jpg": "un Ojo flotante",
            "enemy21.jpg": "un Cofre tramposo",
            "enemy22.jpg": "un Gallo parlanchín",
            "enemy23.jpg": "un Guerrero de la muerte",
            "enemy24.jpg": "una Rata gigante",
            "enemy25.jpg": "un Troll agresivo",
        };
        return nombres[nombreArchivo] || nombreArchivo.replace(".jpg", "");
    };

    this.marcarPareja = function(carta1, carta2, nickAcierto) {
        let miNick = $.cookie("nick");
        this.girarCartaVisual(carta1.id, carta1.valor);
        this.girarCartaVisual(carta2.id, carta2.valor);
        
        let colorBorde;
        
        if (nickAcierto === miNick) {
            colorBorde = "#2ecc71"; 
            
            let nombreBicho = this.obtenerNombreMonstruo(carta1.valor);
            
            let mensajeVictoria = `💀 ¡Has derrotado a <br><span style="color: #ff4444;">${nombreBicho}</span>!`;
            
            this.mostrarAvisoMonedas(10, mensajeVictoria);

        } else {
            colorBorde = "#e74c3c"; 
        }
        this.reproducirAudio("audioPareja");
        $("#carta-" + carta1.id + " .cara").css({
            "border-color": colorBorde,
            "box-shadow": "0 0 15px " + colorBorde 
        });
        
        $("#carta-" + carta2.id + " .cara").css({
            "border-color": colorBorde,
            "box-shadow": "0 0 15px " + colorBorde
        });
    };

    this.actualizarMonedasRival = function(data) {
        let miNick = $.cookie("nick");
        
        if (data.nick !== miNick) {
            
            let idLimpio = this.limpiarId(data.nick); 
            let selector = "#badge-" + idLimpio; 
            
            let badge = $(selector); 
            
            if (badge.length > 0) {
                let span = badge.find('.val');
                
                badge.css('opacity', '1'); 
                
                let actual = parseInt(span.text()) || 0; 
                let nuevo = actual + data.cantidad;
                span.text(nuevo);
                
                badge.addClass('brillo-moneda');
                setTimeout(() => badge.removeClass('brillo-moneda'), 600);
                
                console.log("Monedas actualizadas al rival: " + idLimpio + " Cantidad: " + nuevo);
            } else {
                console.warn("No se encontró el badge del rival. ID buscado: " + selector);
            }
        }
    };
    this.iniciarTemporizador = function() {
        if (this.intervaloTiempo) {
            clearInterval(this.intervaloTiempo);
        }
        let segundos = 15;
        let elementoTiempo = document.getElementById("tiempo");
        let contenedorInfo = document.querySelector(".info-item span#tiempo").parentElement; 
        
        if (elementoTiempo) {
            elementoTiempo.innerText = segundos;
            contenedorInfo.classList.remove("tiempo-agotandose");
        }
        let self = this;
        this.intervaloTiempo = setInterval(function() {
            segundos--;
            
            if (elementoTiempo) {
                elementoTiempo.innerText = segundos;

                if (segundos <= 5) {
                    contenedorInfo.classList.add("tiempo-agotandose");
                }
            }

            if (segundos <= 0) {
                clearInterval(self.intervaloTiempo);
            }
        }, 1000);
    };

    this.usarPocima = function() {
        let nick = $.cookie("nick");
        
        console.log("Click en pócima. Nick:", nick, "Código:", ws.codigo);

        if (!ws.codigo) {
            alert("Error: No se encuentra el código de la partida. Recarga la página.");
            return;
        }
        this.reproducirAudio("audioMagic");
        $('#contenedor-pocima').addClass('animate__rubberBand');
        setTimeout(() => $('#contenedor-pocima').removeClass('animate__rubberBand'), 1000);

        ws.socket.emit("usarPocima", { nick: nick, codigo: ws.codigo });
    };

    this.mostrarRevelacion = function(carta) {
        let nombreMostrar = this.obtenerNombreMonstruo(carta.valor);

        let msg = $(`<div class="mensaje-magico">
                        <img src="./cliente/img/magic.gif" class="icono-mensaje"><br>
                        🔮 ¡El Ojo Arcano revela un secreto!<br>
                        <span style="font-size:1.2rem; color:#d633ff;">¡Es ${nombreMostrar}!</span>
                      </div>`);
        $('body').append(msg);

        this.girarCartaVisual(carta.id, carta.valor);

        let cardDiv = $('#carta-' + carta.id + ' .cara');
        cardDiv.css('border', '3px solid #d633ff'); 
        cardDiv.css('box-shadow', '0 0 20px #d633ff');

        let tarjeta = $('#carta-' + carta.id);
        if (tarjeta.length > 0) {
            $('html, body').animate({
                scrollTop: tarjeta.offset().top - 200 
            }, 800); 
        }

        let self = this;
        setTimeout(function() {
            self.ocultarCartaVisual(carta.id);
            msg.fadeOut(500, function() { $(this).remove(); });
            cardDiv.css('border', '');
            cardDiv.css('box-shadow', '');
        }, 3000); 
    };
    this.mostrarVictoria = function(datos) {
        let audioJuego = document.getElementById("audioJuego");
        if (audioJuego) {
            audioJuego.pause();
            audioJuego.currentTime = 0;
        }
        this.reproducirAudio("audioFin");
        let miNick = $.cookie("nick");
        let ganador = datos.ganador;
        let mensajeTitulo = "";
        let colorTitulo = "";

        if (ganador === miNick) {
            mensajeTitulo = "⚜️°• ¡VICTORIA! •°⚜️";
            colorTitulo = "#FFD700"; 
        } else if (ganador === "empate") {
            mensajeTitulo = "⚖️ EMPATE ⚖️";
            colorTitulo = "#FFFFFF";
        } else {
            mensajeTitulo = "🧌 DERROTA 🧌";
            colorTitulo = "#ff4444"; 
        }

        let listaPuntos = "";
        for (let jugador in datos.puntos) {
            listaPuntos += `
                <li class="list-group-item d-flex justify-content-between align-items-center" 
                    style="background: transparent; color: #fdf6e3; font-size: 1.2rem; border-bottom: 1px solid #5d4037;">
                    ${jugador}
                    <span class="badge badge-warning badge-pill" style="font-size: 1rem;">${datos.puntos[jugador]} 💰</span>
                </li>
            `;
        }

        let html = `
        <div id="pantalla-fin" class="animate__animated animate__fadeIn"
             style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.95); z-index: 99999; 
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    font-family: 'MedievalSharp', cursive;">
            
            <h1 class="animate__animated animate__zoomInDown" 
                style="font-size: 4rem; color: ${colorTitulo}; text-shadow: 0 0 20px ${colorTitulo}, 3px 3px 0 #000; margin-bottom: 30px; text-align: center;">
                ${mensajeTitulo}
            </h1>

            <div class="card p-4 shadow-lg" style="background: #2b1d0e; border: 4px double #c5a05a; color: #fdf6e3; min-width: 320px; max-width: 500px;">
                <h3 class="text-center" style="color: #FFD700; border-bottom: 2px dashed #c5a05a; padding-bottom: 15px; margin-bottom: 15px;">
                    📜 Resultados de la Misión
                </h3>
                <ul class="list-group list-group-flush" style="background: transparent;">
                    ${listaPuntos}
                </ul>
            </div>

            <button id="btnVolverHome" class="btn btn-lg mt-5 shadow-lg animate__animated animate__pulse animate__infinite"
                    style="background-color: #8b4513; color: white; border: 3px solid #FFD700; padding: 15px 40px; font-size: 1.5rem; border-radius: 50px;">
                🏰 Volver al Reino
            </button>
        </div>
        `;

        $('body').append(html);

        $('#btnVolverHome').off('click').on('click', function() {
            $('#pantalla-fin').fadeOut(500, function() {
                $(this).remove(); 
                cw.mostrarHome();
            });
        });
    };

    this.mostrarAvisoMonedas = function(cantidad, mensaje) {
        let actuales = parseInt($('#mis-monedas').text());
        $('#mis-monedas').text(actuales + cantidad);

        let textoMostrar = mensaje || "¡Has encontrado un tesoro!";

        let msg = $(`<div class="mensaje-moneda">
                        <img src="./cliente/img/moneda.gif" class="icono-mensaje"><br>
                        ${textoMostrar}<br>
                        <span style="font-size:1.2rem; color:#FFD700;">+${cantidad} Monedas de Oro</span>
                      </div>`);
        $('body').append(msg);

        setTimeout(function() {
            msg.fadeOut(500, function() { $(this).remove(); });
        }, 3000);
    };
} 