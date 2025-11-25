function ClienteWS(){
    this.socket = undefined;
    this.email = undefined; 
    this.codigo = undefined;
    
    this.ini = function() {
        this.socket = io.connect();
        this.lanzarServidorWS();
    }
    this.lanzarServidorWS = function() {
        let cli = this;

        this.socket.on("partidaCreada", function(datos) {
            console.log("Partida creada con código:", datos.codigo);
            cli.codigo = datos.codigo;
            cw.mostrarPartida(datos.codigo);
        });

        this.socket.on("unidoAPartida", function(datos) {
            console.log("Te has unido a la partida:", datos.codigo);
            cli.codigo = datos.codigo;
            cw.mostrarPartida(datos.codigo);
        });

        this.socket.on("listaPartidas", function(lista) {
            console.log("Partidas disponibles:", lista);
            cw.actualizarListaPartidas(lista);
        });
        this.socket.on("jugadores", function(datos) {
            console.log("Partida lista!");
            cw.mostrarAviso("¡Ya estáis los dos jugadores! A jugar.");
        });
        this.socket.on("jugadores", function(datos) {
            cw.actualizarEstadoPartida(datos);
        });
    }
    this.crearPartida = function() {
        this.socket.emit("crearPartida", { "email": this.email });
    }
    this.unirAPartida = function(codigo) {
        if (!this.email) {
        this.email = $.cookie("nick");
        }
        this.socket.emit("unirAPartida", { "email": this.email, "codigo": codigo });
    }
    this.abandonarPartida = function(codigo) {
        let nick = $.cookie("nick");
        if (nick) {
            this.email = nick;
        }
        this.socket.emit("abandonarPartida", { "email": this.email, "codigo": codigo });
    }
    // En cliente/clienteWS.js

    this.reconectar = function(codigo) {
        this.socket.emit("unirAPartida", { "email": this.email, "codigo": codigo });
    }
    this.ini();
}
