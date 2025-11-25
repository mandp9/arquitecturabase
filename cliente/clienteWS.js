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
        });

        this.socket.on("unidoAPartida", function(datos) {
            console.log("Te has unido a la partida:", datos.codigo);
            cli.codigo = datos.codigo;
        });

        this.socket.on("listaPartidas", function(lista) {
            console.log("Partidas disponibles:", lista);
        });
    }
    this.crearPartida = function() {
        this.socket.emit("crearPartida", { "email": this.email });
    }
    this.unirAPartida = function(codigo) {
        this.socket.emit("unirAPartida", { "email": this.email, "codigo": codigo });
    }
    this.ini();
}
