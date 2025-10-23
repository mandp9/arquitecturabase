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
  this.mostrarAgregarUsuario = function () {
    var html = '';
    html += '<div id="mAU">';
    html += '  <div class="form-group">';
    html += '    <label for="nick">Nick:</label>';
    html += '    <input type="text" class="form-control" id="nick" placeholder="introduce un nick">';
    html += '  </div>';
    html += '  <button id="btnAU" class="btn btn-primary">Submit</button>';
    html += '</div>';

    $('#au').empty().append(html);

    $('#btnAU').on('click', function () {
      var nick = $('#nick').val().trim();
      if (!nick) { alert('Escribe un nick'); return; }
      rest.agregarUsuario(nick);               // llama a tu endpoint
    });
  };
  this.comprobarSesion=function(){
    let nick=localStorage.getItem("nick");
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
   $('#btnSalir').on('click', () => {
    this.salir(); 
  });
  };
  this.salir=function(){
    const nick = localStorage.getItem('nick');
    localStorage.removeItem("nick");
    this.pintarMenu(null);
    this.mostrarMensaje(`¡Hasta luego${nick ? ', ' + nick : ''}!`);
    setTimeout(() => location.reload(), 1200); };
}
