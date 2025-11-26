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
            
            socket.on("disconnect", function() {
                console.log("Usuario desconectado: " + socket.email);
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