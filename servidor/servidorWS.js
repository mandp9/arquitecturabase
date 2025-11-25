function WSServer() {
    this.lanzarServidor = function(io, sistema) {
        let srv = this;
        io.on('connection', function(socket) {
            console.log("Capa WS activa");
            socket.on("crearPartida", function(datos) {
                let res = sistema.crearPartida(datos.email);
                
                if (res.codigo != -1) {
                    socket.join(res.codigo);
                    
                    socket.codigo = res.codigo;
                    socket.email = datos.email;

                    srv.enviarAlRemitente(socket, "partidaCreada", res);
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarATodosMenosRemitente(socket, "listaPartidas", lista);
                    io.in(datos.codigo).emit("jugadores", { 
                        jugadores: [res.propietario, datos.email], 
                        mensaje: "¡A jugar!"
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
                    srv.enviarATodosMenosRemitente(socket, "listaPartidas", lista);

                    let partida = sistema.partidas[datos.codigo];
                    io.in(datos.codigo).emit("jugadores", {
                        jugadores: partida.jugadores,
                        maxJug: partida.maxJug, 
                        mensaje: (partida.jugadores.length === partida.maxJug) ? "¡A jugar!" : "Esperando..." 
                    });
                }
            });

           socket.on("abandonarPartida", function(datos) {
                gestionarAbandono(socket, datos.codigo, datos.email);
            });

            socket.on("disconnect", function() {
                console.log("Usuario desconectado: " + socket.email);
            });
        });
        function gestionarAbandono(socket, codigo, email) {
                let res = sistema.abandonarPartida(email, codigo);
                
                if (res.codigo != -1) {
                    socket.leave(codigo);
                    
                    socket.codigo = undefined;
                    socket.email = undefined;

                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarGlobal(io, "listaPartidas", lista);
                    
                    if (!res.eliminado) {
                        io.to(codigo).emit("jugadorAbandona", {
                            mensaje: "El rival ha abandonado. Esperando nuevo jugador...",
                            propietario: res.propietario
                        });
                    }
                }
            }
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