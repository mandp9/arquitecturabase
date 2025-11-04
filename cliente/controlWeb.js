function ControlWeb() {
  this.pintarMenu = function(nick) {
    const $menu = $("#menu"); // <ul id="menu"> en index.html
    if (nick) {
      $menu.html(`
        <li class="nav-item"><a class="nav-link" href="#home">Inicio</a></li>
        <li class="nav-item"><a class="nav-link" href="#link2">Link 2</a></li>
        <li class="nav-item"><a id="lnkSalir" class="nav-link" href="#">Salir</a></li>
      `);
      $("#lnkSalir").on("click", (e) => { e.preventDefault(); this.salir(); });
    } else {
      $menu.html(`
        <li class="nav-item"><a class="nav-link" href="#login">Inicio sesión</a></li>
        <li class="nav-item"><a class="nav-link" href="#link2">Link 2</a></li>
        <li class="nav-item disabled"><a class="nav-link" href="#" tabindex="-1" aria-disabled="true">Salir</a></li>
      `);
    }
  };
  this.mostrarAgregarUsuario = function(){
    $('#bnv').remove();
    $('#mAU').remove();
    let cadena = '<div id="mAU">';
    cadena = cadena + '<div class="card"><div class="card-body">';
    cadena = cadena + '<div class="form-group">';
    cadena = cadena + '<label for="nick">Nick:</label>';
    cadena = cadena + '<p><input type="text" class="form-control" id="nick" placeholder="introduce un nick"></p>';
    cadena = cadena + '<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
    // Botón “Acceso con Google” igual que en el guion
    cadena = cadena + '<div><a href="/auth/google"><img src="/cliente/img/web_light_rd_SI@1x.png" style="height:40px;"></a></div>';
    cadena = cadena + '</div>';
    cadena = cadena + '</div></div></div>';

    // Inyectamos en el contenedor
    $('#au').empty().append(cadena);

    $('#btnAU').on('click', function(){
      var nick = $('#nick').val().trim();
      if (!nick){ alert('Escribe un nick'); return; }
      rest.agregarUsuario(nick);
  });
};

  this.comprobarSesion=function(){
    const nick = $.cookie('nick');
    this.pintarMenu(nick);
    if (nick){
      this.mostrarMensaje("Bienvenido al sistema, "+nick);
    }
    else{
      this.mostrarAgregarUsuario();
    }
  };
   this.mostrarMensaje = function (msg) {
    const html = `
      <div class="alert alert-info" role="alert">
        ${msg}
      </div>
    `;
    $('#au').html(html);
  };

  this.salir = function () {
    const nick = $.cookie('nick') || localStorage.getItem('nick'); // fallback opcional

    // borrar sesión
    $.removeCookie('nick', { path: '/' });

    // actualizar UI + despedida y recarga
    this.pintarMenu(null);
    this.mostrarMensaje(`¡Hasta luego${nick ? ', ' + nick : ''}!`);
    setTimeout(() => location.reload(), 1200);
};

}
