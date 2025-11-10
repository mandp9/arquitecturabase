const nodemailer = require('nodemailer');
const url = process.env.BASE_URL || "http://localhost:3000/";


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Lee desde .env
    pass: process.env.GMAIL_PASS  // Lee desde .env
  }
});

module.exports.enviarEmail = async function(direccion, key, men) {
  const result = await transporter.sendMail({
    from: 'pirma.ba@gmail.com', 
    to: direccion, 
    subject: men, 
    text: 'Pulsa aquí para confirmar cuenta', 
    html: '<p>Bienvenido a Sistema</p><p><a href="' + url + '/confirmarUsuario/' + direccion + '/' + key + '">Pulsa aquí para confirmar cuenta</a></p>'  });
}
