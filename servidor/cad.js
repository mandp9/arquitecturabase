const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD(){
    this.usuarios;
    this.conectar=async function(callback) {
    let cad=this;
    let client= new
    mongo ("mongodb+srv://mandp9:<Google9>@cluster0.3wzaezh.mongodb.net/?appName=Cluster0"); // Reemplaza 'xxxx'
    await client.connect(); // Establece la conexión
    const database=client.db("sistema"); // Conéctate o crea la base de datos "sistema"
    cad.usuarios=database.collection("usuarios"); // Asigna la colección "usuarios"
    callback(database); // Ejecuta el callback
}
}
module.exports.CAD=CAD;