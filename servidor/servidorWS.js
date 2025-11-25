function WSServer() {
    this.lanzarServidor = function(io, sistema) {
        let srv = this;
        io.on('connection', function(socket) {
            console.log("Capa WS activa");
            socket.on("crearPartida", function(datos) {
                let res = sistema.crearPartida(datos.email);
                
                if (res.codigo != -1) {
                    socket.join(res.codigo);
                    
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
                    
                    srv.enviarAlRemitente(socket, "unidoAPartida", res);
                    
                    let lista = sistema.obtenerPartidasDisponibles();
                    srv.enviarATodosMenosRemitente(socket, "listaPartidas", lista);
                }
            });

        socket.on("abandonarPartida", function(datos) {
            let res = sistema.abandonarPartida(datos.email, datos.codigo);
            
            if (res.eliminado) {
                socket.leave(datos.codigo);
                
                let lista = sistema.obtenerPartidasDisponibles();
                srv.enviarATodosMenosRemitente(socket, "listaPartidas", lista);
                
                srv.enviarAlRemitente(socket, "partidaAbandonada", res);
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