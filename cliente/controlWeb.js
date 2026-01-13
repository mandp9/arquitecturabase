function ControlWeb() {
    this.jugadoresActuales = [];
    this.intervaloTiempo = null;

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
        $('body').css({
            'background-image': 'url("./cliente/img/casss.png")',
            'background-size': 'cover',
            'background-position': 'center',
            'background-attachment': 'fixed'
        });
        this.limpiar();
        let nick = $.cookie("nick");
        $('#gameTitle').show();
        
        this.ultimasPartidas = [];

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
                            📜 Tablón de Partidas
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
    };

    this.mostrarPartida = function(datos) {
        let codigoStr = datos.codigo || datos;
        let propietario = datos.propietario;
        let nick = $.cookie("nick");

        this.limpiar();
        $('#gameTitle').hide();
        
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
                 style="position: absolute; top: 80px; right: 15px; border-radius: 50%; width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; border: 1px solid #FFD700; color: #FFD700; cursor: pointer; background: rgba(0,0,0,0.5);">
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
                <div id="listaJugadoresSala" class="list-group mb-3 font-weight-bold shadow-sm">
                    <li class="list-group-item" style="background-color: rgba(255,255,255,0.7);">Esperando...</li>
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
        
        $('#btnSalirPartida').on('click', function() {
            ws.abandonarPartida(codigoStr);
            cw.mostrarHome();
        });
        $('#btnEliminarPartida').on('click', function() {
          if(confirm("¿Seguro que quieres cerrar la sala?")) {
              ws.eliminarPartida(codigoStr); 
          }
        });

        $('#btnIrAlJuego').on('click', function() {
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
        for (let i = jugadoresValidos.length; i < max; i++) {
          $('#listaJugadoresSala').append(`<li class="list-group-item text-muted">Esperando jugador...</li>`);
        }
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
        $('#au').empty(); 
        $('#registro').empty(); 
        $('#msg').empty(); 
        $('#gameTitle').hide(); 
        $('body').css('background-image', 'none'); 
        
        // Obtenemos los nombres (o ponemos genéricos si falla algo)
        let jug1 = this.jugadoresActuales && this.jugadoresActuales[0] ? this.jugadoresActuales[0] : "Jugador 1";
        let jug2 = this.jugadoresActuales && this.jugadoresActuales[1] ? this.jugadoresActuales[1] : "Jugador 2";

        // NUEVA ESTRUCTURA CON AVATARES A LOS LADOS
        let cadena = `
        <div id="juego">
            <div id="info-turno" class="alert alert-primary text-center" style="font-weight: bold; font-size: 1.2rem; margin: 10px auto; max-width: 800px;">
                Esperando inicio...
            </div>
            <div id="panel-info">
                <div class="info-item">⏳ <span id="tiempo">00:00</span></div>
                <div class="info-item">💰 <span id="mis-monedas">0</span></div>
            </div>
            
            <div class="arena-de-juego">
                
                <div id="avatar-izq" class="contenedor-avatar" data-nick="${jug1}">
                    <img src="./cliente/img/K1.png" alt="${jug1}" class="img-avatar">
                    <div class="nombre-avatar">${jug1}</div>
                </div>

                <div id="tablero" class="grid-cartas"></div>

                <div id="avatar-der" class="contenedor-avatar" data-nick="${jug2}">
                    <img src="./cliente/img/K2.png" alt="${jug2}" class="img-avatar">
                    <div class="nombre-avatar">${jug2}</div>
                </div>

            </div>
        </div>
        `;
        $('#au').html(cadena); 
        
        ws.iniciarPartida(codigo);
    };


    this.pintarTablero = function(datos) {
        // datos puede ser el mazo directo (versión vieja) o {mazo: [], turno: "pepe"}
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
        
        // 1. Actualizar el cartel de texto (como antes)
        if (info) {
            if (turno === nick) {
                info.className = "alert alert-success text-center";
                info.innerHTML = " ¡ES TU TURNO, A PELEAR! ";
            } else {
                info.className = "alert alert-danger text-center";
                info.innerHTML = " Turno de: " + turno;
            }
            
        }

        // 2. Actualizar los AVATARES (Lógica nueva)
        let avIzq = $('#avatar-izq');
        let avDer = $('#avatar-der');

        // Comprobamos de quién es el turno mirando el data-nick que guardamos en el HTML
        if (turno === avIzq.data('nick')) {
            // Turno del jugador de la IZQUIERDA
            avIzq.removeClass('avatar-turno-inactivo').addClass('avatar-turno-activo');
            avDer.removeClass('avatar-turno-activo').addClass('avatar-turno-inactivo');
        } else if (turno === avDer.data('nick')) {
            // Turno del jugador de la DERECHA
            avDer.removeClass('avatar-turno-inactivo').addClass('avatar-turno-activo');
            avIzq.removeClass('avatar-turno-activo').addClass('avatar-turno-inactivo');
        }
        this.iniciarTemporizador();
    };

    this.girarCartaVisual = function(id, valor) {
        let el = document.getElementById("carta-" + id);
        if (el) {
            el.classList.add("girada");
            // Buscamos la etiqueta img dentro del div y le cambiamos el src
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

    this.marcarPareja = function(carta1, carta2) {
        this.girarCartaVisual(carta1.id, carta1.valor);
        this.girarCartaVisual(carta2.id, carta2.valor);
        $("#carta-" + carta1.id + " .cara").css("border-color", "#2ecc71"); 
        $("#carta-" + carta2.id + " .cara").css("border-color", "#2ecc71");
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
}