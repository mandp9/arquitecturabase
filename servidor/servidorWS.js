function WSServer() {
    this.lanzarServidor = function(io, sistema) {
        let srv = this;
        io.on('connection', function(socket) {
            let emailHandshake = socket.handshake.query.email;
            if(emailHandshake && emailHandshake !== "undefined") {
                socket.email = emailHandshake;
            }
            console.log("Capa WS activa. Usuario: " + (socket.email || "Anónimo"));

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
                    // 1. Avisar a todos en la sala que se acabó
                    io.in(datos.codigo).emit("partidaTerminada", { 
                        mensaje: "El creador ha cerrado la sala. Todos fuera." 
                    });
                    
                    // 2. Desconectar sockets de la sala (opcional, pero limpio)
                    io.in(datos.codigo).socketsLeave(datos.codigo); 
                    
                    // 3. Actualizar la lista global
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
                }
            });
            socket.on("voltearCarta", function(datos) {
                let res = sistema.voltearCarta(datos.codigo, datos.nick, datos.idCarta);
                
                if (res) {
                    if (res.tipo === "volteo") {
                        io.in(datos.codigo).emit("cartaVolteada", res.carta);
                    }
                    else if (res.tipo === "pareja") {
                        io.in(datos.codigo).emit("parejaEncontrada", res);
                    }
                    else if (res.tipo === "fallo") {
                        io.in(datos.codigo).emit("cartaVolteada", { id: datos.idCarta, valor: res.carta2.valor }); // Enviamos la que acaba de tocar
                        
                        setTimeout(() => {
                            io.in(datos.codigo).emit("parejaIncorrecta", res);
                        }, 1000);
                    }
                }
            });

            socket.on("disconnect", function() {
                console.log("Usuario desconectado: " + socket.email);
                
                if (socket.codigo && socket.email) {
                    
                    let res = sistema.abandonarPartida(socket.email, socket.codigo);
                    
                    // 2. Si la partida existía...
                    if (res.codigo != -1) {
                        
                        // Si tras irse él, la partida se queda vacía (ya se borró sola en el modelo)
                        if (res.eliminado) {
                            // Solo actualizamos la lista global para los demás
                            let lista = sistema.obtenerPartidasDisponibles();
                            srv.enviarGlobal(io, "listaPartidas", lista);
                        } 
                        else {
                            // Si queda un rival dentro (la partida no se ha borrado aún)
                            // Como quieres que se "cancele", vamos a forzar su eliminación.
                            
                            // Avisamos al rival que queda
                            io.in(socket.codigo).emit("partidaTerminada", { 
                                mensaje: "El rival se ha desconectado. La partida ha sido cancelada." 
                            });
                            
                            // Eliminamos la partida definitivamente del sistema
                            // (Usamos el nick del propietario actual, que ahora es el rival que quedó)
                            sistema.eliminarPartida(res.propietario, res.codigo);
                            
                            // Actualizamos la lista global
                            let lista = sistema.obtenerPartidasDisponibles();
                            srv.enviarGlobal(io, "listaPartidas", lista);
                        }
                    }
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