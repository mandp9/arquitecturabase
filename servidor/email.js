const nodemailer = require('nodemailer');
const gv = require('./gestorVariables.js');
const url = process.env.BASE_URL || "http://localhost:3000/";

let transporter;
let mailUser = "pirma.ba@gmail.com";

gv.obtenerOptions(function(options) {
    mailUser = options.user;
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: options // options ya trae { user: "...", pass: "..." } desde gestorVariables
    });
    console.log("Sistema de correo configurado correctamente. Usuario: " + options.user);
});

module.exports.enviarEmail = async function(direccion, key, men) {
  if (transporter) {
      try {
          const result = await transporter.sendMail({
            from: mailUser, 
            to: direccion, 
            subject: men, 
            text: 'Pulsa aquí para confirmar cuenta', 
            html: '<p>Bienvenido a Sistema</p><p><a href="' + url + '/confirmarUsuario/' + direccion + '/' + key + '">Pulsa aquí para confirmar cuenta</a></p>'
          });
      } catch (error) {
          console.log("Error al enviar el correo:", error);
      }
  } else {
      console.log("El sistema de correo aún no está listo.");
  }
}