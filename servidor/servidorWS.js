function WSServer() {

    this.temporizadores = {};

    this.lanzarServidor = function(io, sistema) {
        let srv = this;
        io.on('connection', function(socket) {
            let emailHandshake = socket.handshake.query.email;
            if(emailHandshake && emailHandshake !== "undefined") {
                socket.email = emailHandshake;
            }
            console.log("Capa WS activa. Usuario: " + (socket.email || "Anónimo"));

            const reiniciarTemporizador = (codigo) => {
                if (srv.temporizadores[codigo]) {
                        clearTimeout(srv.temporizadores[codigo]);
                }
                srv.temporizadores[codigo] = setTimeout(() => {
                    console.log("¡Tiempo agotado en partida " + codigo + "! Cambiando turno...");
                    let nuevoEstado = sistema.forzarCambioTurno(codigo); 
                    
                    if (nuevoEstado) {
                        io.in(codigo).emit("cambioTurno", { turno: nuevoEstado.turno });
                        reiniciarTemporizador(codigo);
                    }
                    }, 16000);
            };
            socket.on("crearPartida", function(datos) {
                let res = sistema.crearPartida(datos.email);
                if (res.codigo != -1) {
                    socket.join(res.codigo);
                    socket.codigo = res.codigo;
                    socket.email = datos.email;
                    srv.enviarAlRemitente(socket, "partidaCreada", res);
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarGlobal(io, "listaPartidas", lista);
                    io.in(res.codigo).emit("jugadores", { 
                        jugadores: [datos.email],
                        maxJug: 2,
                        mensaje: "Esperando rival..."
                    });
                }
            });
            socket.on("unirAPartida", function(datos) {
                let res = sistema.unirAPartida(datos.email, datos.codigo);
                
                if (res.codigo != -1) {
                    socket.join(datos.codigo);
                    socket.codigo = datos.codigo;
                    socket.email = datos.email;

                    srv.enviarAlRemitente(socket, "unidoAPartida", res);
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarGlobal(io, "listaPartidas", lista);
                    
                    let partida = sistema.partidas[datos.codigo];
                
                    io.in(datos.codigo).emit("jugadores", {
                        jugadores: partida.jugadores,
                        maxJug: partida.maxJug,
                        mensaje: (partida.jugadores.length === partida.maxJug) ? "¡Sala llena! Todo listo." : "Esperando rival..."
                    });
                }
            });
            
           socket.on("abandonarPartida", function(datos) {
                let res = sistema.abandonarPartida(datos.email, datos.codigo);
    
                if (res.codigo != -1) {
                    socket.leave(datos.codigo); 
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarGlobal(io, "listaPartidas", lista);
                    

                    if (!res.eliminado) {
                        let partida = sistema.partidas[datos.codigo];
                        
                        io.to(datos.codigo).emit("jugadores", {
                            jugadores: partida.jugadores,
                            maxJug: partida.maxJug,
                            mensaje: "El rival ha abandonado. Esperando nuevo jugador..."
                        });
                    }
                }
            });
            socket.on("eliminarPartida", function(datos) {
                let res = sistema.eliminarPartida(datos.email, datos.codigo);
                if (res.eliminado) {
                    if (srv.temporizadores[datos.codigo]) {
                        clearTimeout(srv.temporizadores[datos.codigo]);
                        delete srv.temporizadores[datos.codigo];
                    }
                    io.in(datos.codigo).emit("partidaTerminada", { 
                        mensaje: "El creador ha cerrado la sala. Todos fuera." 
                    });
                    
                    io.in(datos.codigo).socketsLeave(datos.codigo); 
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarGlobal(io, "listaPartidas", lista);
                }
            });
            socket.on("iniciarPartida", function(datos) {
                let nick = datos.nick || socket.email; 
                let codigo = datos.codigo;
                let res = sistema.iniciarPartida(codigo, nick);

                if (res && res.mazo) {
                    io.in(codigo).emit("partidaIniciada", res.mazo);
                    reiniciarTemporizador(codigo);
                }
            });
            socket.on("voltearCarta", function(datos) {
                let res = sistema.voltearCarta(datos.codigo, datos.nick, datos.idCarta);
                
                if (res) {
                    if (res.tipo === "volteo") {
                        io.in(datos.codigo).emit("cartaVolteada", res.carta);
                        reiniciarTemporizador(datos.codigo);
                    }
                    else if (res.tipo === "pareja") {
                        io.in(datos.codigo).emit("parejaEncontrada", res);
                        reiniciarTemporizador(datos.codigo);
                    }
                    else if (res.tipo === "fallo") {
                        io.in(datos.codigo).emit("cartaVolteada", { id: datos.idCarta, valor: res.carta2.valor }); // Enviamos la que acaba de tocar
                        
                        setTimeout(() => {
                            io.in(datos.codigo).emit("parejaIncorrecta", res);
                            reiniciarTemporizador(datos.codigo);
                        }, 1000);
                    }
                }
            });

            socket.on("disconnect", function() {
                console.log("Usuario desconectado: " + socket.email);
                
                if (socket.codigo && socket.email) {
                    
                    let res = sistema.abandonarPartida(socket.email, socket.codigo);
                    
                    if (res.codigo != -1) {
                        
                        if (res.eliminado) {
                            let lista = sistema.obtenerPartidasDisponibles();
                            srv.enviarGlobal(io, "listaPartidas", lista);
                        } 
                        else {
                            
                            io.in(socket.codigo).emit("partidaTerminada", { 
                                mensaje: "El rival se ha desconectado. La partida ha sido cancelada." 
                            });
                            
                            sistema.eliminarPartida(res.propietario, res.codigo);
                            
                            let lista = sistema.obtenerPartidasDisponibles();
                            srv.enviarGlobal(io, "listaPartidas", lista);
                        }
                    }
                }
            });
            socket.on("usarPocima", function(datos) { 
                
                console.log("Petición de pócima recibida de: " + datos.nick + " en partida: " + datos.codigo);
                
                let partida = sistema.partidas[datos.codigo];
                if (partida) {
                    let resultado = partida.usarPocima(datos.nick);
                    
                    if (resultado) {
                        console.log("Pócima usada con éxito. Efecto: " + resultado.efecto);

                        socket.emit("pocimaUsada", { restantes: resultado.restantes });

                        if (resultado.efecto === "monedas") {
                            sistema.sumarMonedas(datos.nick, resultado.valor);
                            socket.emit("efectoPocima", { 
                                mensaje: "🧪 ¡La pócima contenía oro! Has ganado 10 monedas.",
                                tipo: "monedas",
                                valor: 10
                            });
                        } 
                        else if (resultado.efecto === "revelar") {
                            socket.emit("efectoPocima", { 
                                mensaje: "👁️ La pócima te revela una carta...",
                                tipo: "revelar",
                                carta: resultado.carta
                            });
                        }
                    } else {
                        console.log("Fallo al usar pócima (No es turno o no quedan)");
                    }
                } else {
                    console.log("Partida no encontrada: " + datos.codigo);
                }
            }); 
            
        }); 
    }
    this.enviarAlRemitente = function(socket, mensaje, datos) {
        socket.emit(mensaje, datos);
    }

    this.enviarATodosMenosRemitente = function(socket, mensaje, datos) {
        socket.broadcast.emit(mensaje, datos);
    }

    this.enviarGlobal = function(io, mensaje, datos) {
        io.emit(mensaje, datos);
    }
}

module.exports.WSServer = WSServer;