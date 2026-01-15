const datos=require("./cad.js");
const correo = require("./email.js");
const bcrypt = require('bcrypt');

function Sistema(test){
  this.usuarios = {};
  this.partidas = {};
  this.cad=new datos.CAD();
 
  if(!test.test){
    this.cad.conectar(function(db){
      console.log("Conectado a Mango Atlas");});
      //Aqui puedes realizar operaciones con la base de datos
  }

  this.agregarUsuario = function(nick){
    let res={"nick":-1};
    if (!this.usuarios[nick]){
      this.usuarios[nick]=new Usuario(nick);
      res.nick=nick;
    }
    else{
      console.log("el nick "+nick+" está en uso");
    }
    return res;
  };
  this.obtenerUsuarios = function(){   
    return this.usuarios;
  };
  this.obtenerUsuario = function(email, callback) {
    if (this.cad) {
      this.cad.buscarUsuario({ "email": email }, function(usr) {
        if (usr) {
          callback(usr);
        } else {
          callback({ email: email, monedas: 0 });
        }
      });
    } else {
      // Si estamos en modo test sin BBDD
      callback({ email: email, monedas: 0 });
    }
  };
  this.usuarioActivo = function(nick){
    return this.usuarios.hasOwnProperty(nick);
  };
  this.eliminarUsuario = function(nick){
    this.insertarLog("cerrarSesion", nick);
    if(this.usuarioActivo(nick)){
        delete this.usuarios[nick];
        return true;
    }else{
        return false;
    }
  };
  this.numeroUsuarios = function(){
    return Object.keys(this.usuarios).length;
  };
  this.usuarioGoogle=function(usr,callback){
    let modelo = this;
    this.cad.buscarOCrearUsuario(usr,function(obj){
    callback(obj);
    modelo.insertarLog("inicioGoogle", obj.email);
  });
  };
  this.registrarUsuario=function(obj,callback){
    let modelo=this;
    if (!obj.nick){
     obj.nick=obj.email;
    }
    this.cad.buscarUsuario({ "email": obj.email }, async function(usr){
    if (!usr){
      obj.key = Date.now().toString();
      obj.confirmada = false;
      obj.password = await bcrypt.hash(obj.password, 10); 
      modelo.cad.insertarUsuario(obj, function(res) {
          correo.enviarEmail(obj.email, obj.key, "Confirma cuenta");
          callback(res);
          modelo.insertarLog("registroUsuario", res.email);
      });
    }
    else
    {
      callback({"email":-1});
    }
    });
};
this.confirmarUsuario = function(obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": false, "key": obj.key }, function(usr) {
        if (usr) {
            usr.confirmada = true; 
            modelo.cad.actualizarUsuario(usr, function(res) {
                callback({ "email": res.email }); 
            });
        } else {
            callback({ "email": -1 }); 
        }
    });
};

this.loginUsuario = function(obj, callback) {
    let modelo = this;
    this.cad.buscarUsuario({ "email": obj.email, "confirmada": true }, function(usr) {
        if (!usr) {
            callback(undefined);
            return -1;
        }
        
        bcrypt.compare(obj.password, usr.password, function(err, result) {
            if (result) {
                callback(usr);
                modelo.insertarLog("inicioLocal", usr.email);
            } else {
                callback(undefined);
            }
        });
    });
};
this.crearPartida = function(email) {
        let codigo = this.obtenerCodigo();
        let partida = new Partida(codigo, email);
        partida.agregarJugador(email);
        this.partidas[codigo] = partida;
        this.insertarLog("crearPartida", email);
        return { codigo: codigo, propietario: email };
};
this.unirAPartida = function(email, codigo) {
        let partida = this.partidas[codigo];
        if (partida) {
            if (partida.jugadores.includes(email)) {
                console.log("El usuario " + email + " se reconecta a la partida " + codigo);
                return { 
                    codigo: codigo, 
                    estado: partida.estado, 
                    propietario: partida.propietario 
                };
            }
            if (partida.estado === "abierta") {
                partida.agregarJugador(email);
                this.insertarLog("unirAPartida", email);
                return { 
                    codigo: codigo, 
                    estado: partida.estado, 
                    propietario: partida.propietario 
                };
            }
        }
        
        return { codigo: -1 };
    };
  this.obtenerPartidasDisponibles = function() {
        let lista = [];
        for (let key in this.partidas) {
            let partida = this.partidas[key];
            if (partida.estado === "abierta") {
                lista.push({ codigo: partida.codigo, propietario: partida.propietario });
            }
        }
        return lista;
  };
  this.obtenerCodigo = function() {
        let cadena = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let nombre = "";
        for (let i = 0; i < 6; i++) {
            nombre += cadena.charAt(Math.floor(Math.random() * cadena.length));
        }
        return nombre;
  };
    this.abandonarPartida = function(email, codigo) {
        if (this.partidas[codigo]) {
            let partida = this.partidas[codigo];
            
            let index = partida.jugadores.indexOf(email);
            if (index > -1) {
                partida.jugadores.splice(index, 1);
            }

            if (partida.jugadores.length === 0) {
                delete this.partidas[codigo];
                return { codigo: codigo, eliminado: true, propietario: email };
            }
            
            partida.estado = "abierta";
            partida.propietario = partida.jugadores[0]; 
            
            return { codigo: codigo, eliminado: false, propietario: partida.propietario };
        }
        return { codigo: -1 };
    };
    this.eliminarPartida = function(email, codigo) {
        if (this.partidas[codigo]) {
            if (this.partidas[codigo].propietario === email) {
                delete this.partidas[codigo];
                return { codigo: codigo, eliminado: true };
            }
        }
        return { codigo: -1, eliminado: false };
    };

    this.iniciarPartida = function(codigo, nick) {
        let partida = this.partidas[codigo];
        
        if (partida) {
            if (partida.estado === "jugando") {
                if (partida.jugadores.includes(nick)) {
                    return partida.iniciarJuego();
                }
            }
            
            else if (partida.jugadores.length === 2) {
                if (partida.jugadores.includes(nick)) {
                    return partida.iniciarJuego();
                }
            }
        }
        return null;
    };

    this.buscarPartidaDeUsuario = function(email) {
        for (let codigo in this.partidas) {
            let partida = this.partidas[codigo];
            if (partida.jugadores.includes(email)) {
                return { codigo: codigo, propietario: partida.propietario };
            }
        }
        return null; 
    };
    this.insertarLog = function(tipo, usuario) {
        let registro = {
            "tipo-operacion": tipo,
            "usuario": usuario,
            "fecha-hora": new Date().toISOString()
        };
        if (this.cad) {
            this.cad.insertarLog(registro, function(res) {
                console.log("Log registrado: " + tipo);
            });
        }
    };
    this.obtenerLogs = function(callback) {
        if (this.cad) {
            this.cad.obtenerLogs(callback);
        } else {
            callback([]);
        }
    };
    this.sumarMonedas = function(email, cantidad) {
        if (this.cad) {
            this.cad.sumarMonedas(email, cantidad, function(nuevasMonedas) {
                console.log("Monedas guardadas para " + email + ": " + nuevasMonedas);
            });
        }
    };
    this.voltearCarta = function(codigo, nick, idCarta) {
        let partida = this.partidas[codigo];
        
        if (partida) {
            // Delegamos la acción a la partida, que es quien tiene el mazo
            return partida.voltearCarta(idCarta, nick);
        } else {
            console.log("No se encuentra la partida con código: " + codigo);
            return null;
        }
    };

    this.calcularEfectoCarta = function(valorCarta) {

        return { 
            monedas: 10, 
            tipo: "estandar" 
        };
    };
    this.forzarCambioTurno = function(codigo) {
        let partida = this.partidas[codigo];
        if (partida) {
            partida.cambiarTurno();
            
            console.log("Turno forzado en partida " + codigo + ". Ahora le toca a: " + partida.turno);
            return { turno: partida.turno };
        }
        return null;
    };
}

function Usuario(nick){
  this.nick = nick;
}

function Partida(codigo, propietario) {
    this.codigo = codigo;
    this.propietario = propietario;
    this.jugadores = [];
    this.maxJug = 2;
    this.estado = "abierta"; 
    this.mazo = [];
    this.cartasLevantadas = []; 
    this.turno = undefined; 
    this.pocimas = {};

    this.puntos = {};
    this.limiteVolteo = 2;

    this.fondosDisponibles = [
        "battle1.jpg",
        "battle2.jpg",
        "battle3.jpg",
        "battle4.jpg",
        "battle5.jpg",
    ];
    this.fondo = this.fondosDisponibles[Math.floor(Math.random() * this.fondosDisponibles.length)];

    this.agregarJugador = function(nick) {
        if (this.jugadores.includes(nick)) return true;
        if (this.jugadores.length < this.maxJug) {
            this.jugadores.push(nick);
            this.pocimas[nick] = 1
            this.puntos[nick] = 0;
            if (this.jugadores.length === this.maxJug) this.estado = "completa";
            return true;
        }
        return false;
    }
    this.usarPocima = function(nick) {
        if (this.turno !== nick) return null;
        
        if (this.pocimas[nick] > 0) {
            this.pocimas[nick]--; 
            let azar = Math.random();

            if (azar < 0.5) {
                if (!this.puntos[nick]) this.puntos[nick] = 0;
                this.puntos[nick] += 10; 

                return { 
                    efecto: "monedas", 
                    valor: 10, 
                    restantes: this.pocimas[nick] 
                };
            } else {
                let ocultas = this.mazo.filter(c => c.estado === 'oculta');
                if (ocultas.length > 0) {
                    let cartaRevelada = ocultas[Math.floor(Math.random() * ocultas.length)];
                    return { 
                        efecto: "revelar", 
                        carta: cartaRevelada, 
                        restantes: this.pocimas[nick] 
                    };
                } else {
                    if (!this.puntos[nick]) this.puntos[nick] = 0;
                    this.puntos[nick] += 10;
                    return { efecto: "monedas", valor: 10, restantes: this.pocimas[nick] };
                }
            }
        }
        return null; 
    }

    this.iniciarJuego = function() {
        if (this.estado == "jugando") {
        return { 
            mazo: this.mazo, 
            turno: this.turno,
            fondo: this.fondo 
        };
    }
        if (this.estado != "jugando") {
            this.estado = "jugando";
            this.mazo = this.generarMazo(8);
            this.turno = this.jugadores[Math.floor(Math.random() * this.jugadores.length)];
            return { 
                mazo: this.mazo, 
                turno: this.turno,
                fondo: this.fondo 
            };
        }
        return null;
    }

    this.generarMazo = function(numParejas) {
        let totalCartas = [];
        for(let j=1; j<=25; j++) {
            totalCartas.push(j);
        }

        for (let i = totalCartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [totalCartas[i], totalCartas[j]] = [totalCartas[j], totalCartas[i]];
        }
        
        let seleccionadas = totalCartas.slice(0, numParejas);

        let cartas = [];
        for(let i=0; i<seleccionadas.length; i++) {
            let nombreImagen = "enemy" + seleccionadas[i] + ".jpg"; // Ej: "enemy5.jpg"
            
            cartas.push({ id: i*2, valor: nombreImagen, estado: 'oculta' });
            cartas.push({ id: i*2+1, valor: nombreImagen, estado: 'oculta' });
        }
        
        for (let i = cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
        }
        
        return cartas;
    }
    this.calcularEfectoCarta = function(valorCarta, nick, idCarta) {
        if (valorCarta === "enemy19.jpg") {
            return { monedas: -10, tipo: "trampa" };
        } 
        else if (valorCarta === "enemy18.jpg") {
            if (!this.pocimas[nick]) this.pocimas[nick] = 0;
            this.pocimas[nick]++; 
            return { monedas: 10, tipo: "pocima" };
        } 
        else if (valorCarta === "enemy9.jpg") {
            this.limiteVolteo = 3; 
            console.log("Poder del Hechicero activado: Límite de volteo sube a 3");
            return { monedas: 0, tipo: "hechicero" };
        } 
        else if (valorCarta === "enemy21.jpg") {
            let esBueno = (idCarta % 2 === 0);
            if (esBueno) return { monedas: 20, tipo: "cofre_bueno" }; // +20
            else return { monedas: -10, tipo: "mimic" };
        }
        return { monedas: 10, tipo: "estandar" };
    };

    this.voltearCarta = function(idCarta, nick) {
        if (this.turno !== nick) return null;

        let carta = this.mazo.find(c => c.id == idCarta);

        if (carta && carta.estado === 'oculta' && this.cartasLevantadas.length < this.limiteVolteo) {
            carta.estado = 'visible';
            this.cartasLevantadas.push(carta);

            if (this.cartasLevantadas.length === this.limiteVolteo) {
                let carta1 = null; 
                let carta2 = null;
                let encontrada = false;
                let cartaSobrante = null; 

                // Buscamos la pareja entre las 2 o 3 cartas
                for(let i=0; i<this.cartasLevantadas.length; i++) {
                    for(let j=i+1; j<this.cartasLevantadas.length; j++) {
                        if (this.cartasLevantadas[i].valor === this.cartasLevantadas[j].valor) {
                            carta1 = this.cartasLevantadas[i];
                            carta2 = this.cartasLevantadas[j];
                            encontrada = true;
                            break;
                        }
                    }
                    if(encontrada) break;
                }

                if (encontrada) {
                    carta1.estado = 'encontrada';
                    carta2.estado = 'encontrada';
                    
                    // Identificamos la carta sobrante y la ocultamos en servidor
                    this.cartasLevantadas.forEach(c => {
                        if (c.id !== carta1.id && c.id !== carta2.id) {
                            c.estado = 'oculta';
                            cartaSobrante = c; 
                        }
                    });
                    
                    this.cartasLevantadas = [];
                    let efecto = this.calcularEfectoCarta(carta1.valor, nick, carta1.id);
                    if (!this.puntos[nick]) this.puntos[nick] = 0;
                    this.puntos[nick] += efecto.monedas;

                    let quedanOcultas = this.mazo.some(c => c.estado === 'oculta' || c.estado === 'visible');
                    if (!quedanOcultas) {
                        this.estado = "finalizada";
                        return { tipo: "final", carta1: carta1, carta2: carta2, turno: this.turno, monedas: efecto.monedas, ganador: this.calcularGanador(), puntos: this.puntos };
                    }

                    // ENVIAMOS 'cartaOcultar' AL CLIENTE
                    return { 
                        tipo: "pareja", 
                        carta1: carta1, 
                        carta2: carta2, 
                        cartaOcultar: cartaSobrante, // ESTO ES LA CLAVE
                        turno: this.turno, 
                        monedas: efecto.monedas 
                    };

                } else {
                    // FALLO
                    let cartasFallo = [...this.cartasLevantadas];
                    this.cartasLevantadas.forEach(c => c.estado = 'oculta');
                    this.cartasLevantadas = [];
                    this.cambiarTurno();
                    
                    // Enviamos TODAS las cartas levantadas para que el cliente las tape
                    return { 
                        tipo: "fallo", 
                        cartas: cartasFallo, // Array completo
                        carta1: cartasFallo[0], 
                        carta2: cartasFallo[1], 
                        turno: this.turno 
                    };
                }
            }
            return { tipo: "volteo", carta: carta, turno: this.turno };
        }
        return null;
    };

    this.calcularGanador = function() {
        let jug1 = this.jugadores[0];
        let jug2 = this.jugadores[1];
        
        if (this.puntos[jug1] > this.puntos[jug2]) return jug1;
        if (this.puntos[jug2] > this.puntos[jug1]) return jug2;
        return "empate";
    }
    this.cambiarTurno = function() {
        let index = this.jugadores.indexOf(this.turno);
        this.turno = this.jugadores[(index + 1) % this.jugadores.length];
        this.limiteVolteo = 2;
    }
}

module.exports.Sistema = Sistema;
