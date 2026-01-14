function ClienteWS(){
    this.socket = undefined;
    this.email = undefined; 
    this.codigo = undefined;
    
    this.ini = function() {
        let nick = $.cookie("nick");

        this.socket = io.connect(undefined, { query: { email: nick } });
        this.lanzarServidorWS();
        this.codigo = undefined;
    }
    this.lanzarServidorWS = function() {
        let cli = this;

        this.socket.on("partidaCreada", function(datos) {
            ws.codigo = datos.codigo;
            console.log("Partida creada con código:", datos.codigo);
            cli.codigo = datos.codigo;
            cw.mostrarPartida(datos);
        });

        this.socket.on("unidoAPartida", function(datos) {
            ws.codigo = datos.codigo;
            console.log("Te has unido a la partida:", datos.codigo);
            cli.codigo = datos.codigo;
            cw.mostrarPartida(datos);
        });

        this.socket.on("listaPartidas", function(lista) {
            console.log("Partidas disponibles:", lista);
            cw.actualizarListaPartidas(lista);
        });
        this.socket.on("jugadores", function(datos) {
            cw.actualizarEstadoPartida(datos);
        });
        this.socket.on("partidaTerminada", function(datos) {
            cw.mostrarHome();
            cw.mostrarModal(datos.mensaje);
            cli.codigo = undefined;
        });
        this.socket.on("partidaIniciada", function(datos) {
            cw.pintarTablero(datos);
        });
        this.socket.on("cartaVolteada", function(carta) {
            cw.girarCartaVisual(carta.id, carta.valor);
        });

        this.socket.on("parejaEncontrada", function(res) {
            cw.marcarPareja(res.carta1, res.carta2);
            cw.iniciarTemporizador();
        });

        this.socket.on("parejaIncorrecta", function(res) {
            cw.ocultarCartaVisual(res.carta1.id);
            cw.ocultarCartaVisual(res.carta2.id);
            cw.actualizarTurno(res.turno);
        });
        this.socket.on("cambioTurno", function(datos) {
            cw.actualizarTurno(datos.turno);
        });
        this.socket.on("pocimaUsada", function(datos) {
        $('#lblPocimas').text(datos.restantes);
        
        if (datos.restantes == 0) {
            $('.img-pocima').css('filter', 'grayscale(100%)');
            $('.img-pocima').removeClass('animate__infinite');
            $('#contenedor-pocima').css('cursor', 'default');
        }
        });

        this.socket.on("efectoPocima", function(datos) {
            
            if (datos.tipo === "monedas") {
                let actuales = parseInt($('#mis-monedas').text());
                $('#mis-monedas').text(actuales + 10);
            
                alert(datos.mensaje); 
            } 
            else if (datos.tipo === "revelar") {
                let carta = datos.carta; 
               
                alert(datos.mensaje + "\nEs un: " + carta.valor);
 
            }
        });
    }
    this.crearPartida = function() {
        let nick = $.cookie("nick"); 
        
        if (nick) {
            this.email = nick;
            console.log("Enviando petición crearPartida con:", nick);
            this.socket.emit("crearPartida", { "email": nick });
        } else {
            console.error("No se pudo crear partida: Cookie 'nick' no encontrada.");
            window.location.href = "/";
        }
    }
    this.unirAPartida = function(codigo) {
        if (!this.email) {
        this.email = $.cookie("nick");
        }
        this.socket.emit("unirAPartida", { "email": this.email, "codigo": codigo });
    }
    this.abandonarPartida = function(codigo) {
        this.socket.emit("abandonarPartida", { "email": this.email, "codigo": codigo });
    }

    this.eliminarPartida = function(codigo) {
       
        let email = this.email || $.cookie("nick");
        
        console.log("Intentando borrar partida:", codigo, "Usuario:", email); // Log para depurar
        this.socket.emit("eliminarPartida", { "email": email, "codigo": codigo });
    }
    this.iniciarPartida = function(codigo) {
        let email = this.email || $.cookie("nick");
        console.log("Iniciando partida:", codigo, "Usuario:", email);
        this.socket.emit("iniciarPartida", { 
            "codigo": codigo, 
            "nick": email, // El servidor espera 'nick' o 'email' según tu servidorWS.js
            "email": email 
        });
    }

    this.voltearCarta = function(idCarta) {
        let email = this.email || $.cookie("nick");
        if (this.codigo && email) {
            this.socket.emit("voltearCarta", { 
                "nick": email, 
                "codigo": this.codigo, 
                "idCarta": idCarta 
            });
        }
    }

    this.lanzarSocketSrv = function() {
        // ... existing listeners ...
        this.socket.on("partidaIniciada", function(mazo) {
            cw.pintarTablero(mazo);
        });
    }

    this.ini();
}

