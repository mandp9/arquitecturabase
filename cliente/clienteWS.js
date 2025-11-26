function ClienteWS(){
    this.socket = undefined;
    this.email = undefined; 
    this.codigo = undefined;
    
    this.ini = function() {
        let nick = $.cookie("nick");

        this.socket = io.connect(undefined, { query: { email: nick } });
        this.lanzarServidorWS();
    }
    this.lanzarServidorWS = function() {
        let cli = this;

        this.socket.on("partidaCreada", function(datos) {
            console.log("Partida creada con código:", datos.codigo);
            cli.codigo = datos.codigo;
            cw.mostrarPartida(datos);
        });

        this.socket.on("unidoAPartida", function(datos) {
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
            cw.mostrarAviso(datos.mensaje);
            cw.mostrarHome();
            cli.codigo = undefined;
        });
    }
    this.crearPartida = function() {
        let nick = $.cookie("nick"); 
        
        if (nick) {
            this.email = nick; // Actualizamos la variable local
            console.log("Enviando petición crearPartida con:", nick);
            this.socket.emit("crearPartida", { "email": nick });
        } else {
            console.error("No se pudo crear partida: Cookie 'nick' no encontrada.");
            // Opcional: Redirigir al login si no hay cookie
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
        // Antes enviaba 'this.email' que podía ser undefined.
        // Ahora forzamos a leer la cookie si la variable está vacía.
        let email = this.email || $.cookie("nick");
        
        console.log("Intentando borrar partida:", codigo, "Usuario:", email); // Log para depurar
        this.socket.emit("eliminarPartida", { "email": email, "codigo": codigo });
    }

    this.ini();
}
