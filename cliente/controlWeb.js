function ControlWeb() {
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
}
