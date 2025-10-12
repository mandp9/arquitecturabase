const modelo = require("./modelo.js");

describe('El sistema', function() {
  let sistema;

  beforeEach(function() {
    sistema = new Sistema();
  });

  it('inicialmente no hay usuarios', function() {
    expect(sistema.numeroUsuarios()).toEqual(0);
  });

   it('agregar usuario', function() {
    sistema.agregarUsuario('Maria');
    expect(sistema.numeroUsuarios()).toEqual(1);
    expect(sistema.usuarioActivo('Maria')).toBeTrue();
  });

    it('eliminar usuario', function(){
      sistema.agregarUsuario('Maria');
      const eliminado = sistema.eliminarUsuario('Maria');
      expect(eliminado).toBeTrue();
      expect(sistema.usuarioActivo('Maria')).toBeFalse();
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
      expect(sistema.usuarioActivo('Maria')).toBeTrue();
      expect(sistema.usuarioActivo('Pedro')).toBeFalse();
    });
});
