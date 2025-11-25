jest.mock('@google-cloud/secret-manager', () => ({
    SecretManagerServiceClient: class {
        async accessSecretVersion() {
            return [{ payload: { data: Buffer.from("secreto_falso") } }];
        }
    }
}));

// Simular Nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

const modelo = require("./modelo.js");

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
  
    it('usuario activo', function(){
      sistema.agregarUsuario('Maria');
      expect(sistema.usuarioActivo('Maria')).toBe(true);
      expect(sistema.usuarioActivo('Pedro')).toBe(false);
    });
});

//npm run testW