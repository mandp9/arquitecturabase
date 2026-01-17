const modelo = require("./modelo.js");


jest.mock('@google-cloud/secret-manager', () => ({
    SecretManagerServiceClient: class {
        async accessSecretVersion() {
            return [{ payload: { data: Buffer.from("secreto_falso") } }];
        }
    }
}));

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

jest.mock("./cad.js", () => ({
    CAD: class {
        conectar(cb) { cb && cb(this); }
        buscarUsuario(criterio, cb) { cb(null); }
        insertarUsuario(usuario, cb) { cb(usuario); }
        actualizarUsuario(usuario, cb) { cb(usuario); }
        buscarOCrearUsuario(usuario, cb) { cb(usuario); }
        insertarLog(log, cb) { if(cb) cb(log); } // Esto evita el error de insertOne
        obtenerLogs(cb) { cb([]); }
    }
}));

describe('El sistema', function() {
  let sistema;

  beforeEach(function() {
    sistema = new modelo.Sistema({test:true});
  });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios()).toEqual(0);
  });

   it('agregar usuario', function() {
    sistema.agregarUsuario('Maria');
    expect(sistema.numeroUsuarios()).toEqual(1);
    expect(sistema.usuarioActivo('Maria')).toBe(true);
  });

    it('eliminar usuario', function(){
      sistema.agregarUsuario('Maria');
      const eliminado = sistema.eliminarUsuario('Maria');
      expect(eliminado).toBe(true);
      expect(sistema.usuarioActivo('Maria')).toBe(false);
      expect(sistema.numeroUsuarios()).toEqual(0);
  });

    it('obtener usuarios', function(){
      sistema.agregarUsuario('Maria');
      sistema.agregarUsuario('Laura');
      const usuarios = sistema.obtenerUsuarios();
      expect(usuarios['Maria'].nick).toEqual('Maria');
      expect(usuarios['Laura'].nick).toEqual('Laura');
    });
    
    it('crear una partida', function() {
        sistema.agregarUsuario('Pepe');
        const res = sistema.crearPartida('Pepe');
        expect(res.codigo).toBeDefined();
        expect(res.propietario).toBe('Pepe');
    });
    it('unir jugador a partida', function() {
        sistema.agregarUsuario('Pepe');
        sistema.agregarUsuario('Juan');
        const resCrear = sistema.crearPartida('Pepe');
        
        const resUnir = sistema.unirAPartida('Juan', resCrear.codigo);
        expect(resUnir.codigo).toBe(resCrear.codigo);
        
        const partida = sistema.partidas[resCrear.codigo];
        expect(partida.jugadores.length).toBe(2);
        expect(partida.jugadores).toContain('Juan');
    });

    it('usuario activo', function(){
      sistema.agregarUsuario('Maria');
      expect(sistema.usuarioActivo('Maria')).toBe(true);
      expect(sistema.usuarioActivo('Pedro')).toBe(false);
    });
});
//npm test