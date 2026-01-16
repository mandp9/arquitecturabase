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
        this.socket.on("finalPartida", function(datos) {
            setTimeout(function() {
                cw.mostrarVictoria(datos);
            }, 1500);
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
            cw.marcarPareja(res.carta1, res.carta2, res.turno, res.cartaOcultar);
            cw.iniciarTemporizador();
        });
        
        this.socket.on("parejaIncorrecta", function(res) {
            console.log("Fallo:", res);
            
            if (res.cartas) {
                res.cartas.forEach(c => cw.girarCartaVisual(c.id, c.valor));
            } else {
                cw.girarCartaVisual(res.carta1.id, res.carta1.valor);
                cw.girarCartaVisual(res.carta2.id, res.carta2.valor);
            }

            if (res.cartas) {
                res.cartas.forEach(function(c) {
                    cw.ocultarCartaVisual(c.id);
                });
            } else {
                cw.ocultarCartaVisual(res.carta1.id);
                cw.ocultarCartaVisual(res.carta2.id);
            }
            
            cw.actualizarTurno(res.turno);
        });
        this.socket.on("cambioTurno", function(datos) {
            cw.actualizarTurno(datos.turno);
        });
        this.socket.on("actualizarMonedas", function(datos) {
            cw.actualizarMonedasRival(datos);
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
                cw.mostrarAvisoMonedas(datos.valor, " ⋆˚꩜｡ Gracias a la pócima");
            } 
            else if (datos.tipo === "revelar") {
                cw.mostrarRevelacion(datos.carta);
            }
            else if (datos.tipo === "error") {
                alert(datos.mensaje); 
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
        
        console.log("Intentando borrar partida:", codigo, "Usuario:", email); 
        this.socket.emit("eliminarPartida", { "email": email, "codigo": codigo });
    }
    this.iniciarPartida = function(codigo) {
        let email = this.email || $.cookie("nick");
        console.log("Iniciando partida:", codigo, "Usuario:", email);
        this.socket.emit("iniciarPartida", { 
            "codigo": codigo, 
            "nick": email, 
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
        this.socket.on("partidaIniciada", function(mazo) {
            cw.pintarTablero(mazo);
        });
    }

    this.ini();
}

