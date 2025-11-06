const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD(){
    this.usuarios;
    this.conectar=async function(callback) {
        let cad=this;
        let client= new
        mongo ("mongodb+srv://mandp9:temp1234@cluster0.3wzaezh.mongodb.net/?appName=Cluster0"); // Reemplaza 'xxxx'
        await client.connect(); // Establece la conexión
        const database=client.db("sistema"); // Conéctate o crea la base de datos "sistema"
        cad.usuarios=database.collection("usuarios"); // Asigna la colección "usuarios"
        callback(database); // Ejecuta el callback
    }
    this.buscarOCrearUsuario=function(usr,callback){
        buscarOCrear(this.usuarios,usr,callback);
    }
    function buscarOCrear(coleccion,criterio,callback)
    {
        coleccion.findOneAndUpdate(criterio, {$set: criterio}, {upsert:
        true,returnDocument:"after",projection:{email:1}}, function(err,doc) {
        if (err) { throw err; }
        else {
            console.log("Elemento actualizado");
            console.log(doc.value.email);
            callback({email:doc.value.email});
        }
        });
    }

}
module.exports.CAD=CAD;