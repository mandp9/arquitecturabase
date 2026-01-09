const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function buscarOCrear(coleccion, criterio, callback) {
    coleccion.findOneAndUpdate(criterio, { $set: criterio }, {
        upsert: true,
        returnDocument: "after"
    }, function(err, doc) {
        if (err) {
            throw err;
        } else {
            console.log("Elemento actualizado");
            if (doc.value.monedas === undefined) {
                coleccion.updateOne({ _id: doc.value._id }, { $set: { monedas: 0 } }, function(err2, res) {
                    console.log("Cuenta nueva: Monedas inicializadas a 0");
                    callback({ email: doc.value.email, monedas: 0 });
                });
            } else {
                console.log("Usuario recurrente: Monedas " + doc.value.monedas);
                callback({ email: doc.value.email, monedas: doc.value.monedas });
            }
        }
    });
}

function buscar(coleccion,criterio,callback){
    coleccion.find(criterio).toArray(function(error,usuarios){
    if (usuarios.length==0){
        callback(undefined);
    }
    else{
        callback(usuarios[0]);
    }
    });
}
function insertar(coleccion,elemento,callback){
    coleccion.insertOne(elemento,function(err,result){
    if(err){
        console.log("error");
    }
    else{
        console.log("Nuevo elemento creado");
        callback(elemento);
    }
    });
}
function insertarLog(coleccion, elemento, callback) {
    coleccion.insertOne(elemento, function(err, result) {
        if (err) {
            console.log("Error al insertar log");
        } else {
            console.log("Nuevo log registrado");
            if (callback) callback(result);
        }
    });
}

function obtenerLogs(coleccion, callback) {
    coleccion.find({}).toArray(function(error, logs) {
        if (error) {
            callback([]);
        } else {
            callback(logs);
        }
    });
}

function sumarMonedas(coleccion, email, cantidad, callback) {
    coleccion.findOneAndUpdate(
        { email: email },
        { $inc: { monedas: cantidad } },
        { returnDocument: "after" },
        function(err, doc) {
            if (err) {
                console.log("Error al sumar monedas");
            } else if (doc.value) {
                console.log("Monedas actualizadas. Total: " + doc.value.monedas);
                if (callback) callback(doc.value.monedas);
            }
        }
    );
}

function CAD(){
    this.usuarios;
    this.logs;

    this.conectar=async function(callback) {
        let cad=this;
        let client = new mongo(process.env.MONGO_URI); 
        await client.connect(); 
        const database=client.db("sistema"); 
        cad.usuarios=database.collection("usuarios"); 
        cad.partidas=database.collection("partidas");
        cad.logs = database.collection("logs");
        callback(database); 
    }
    this.buscarOCrearUsuario=function(usr,callback){
        buscarOCrear(this.usuarios,usr,callback);
    }
    this.buscarUsuario=function(obj,callback){
        buscar(this.usuarios,obj,callback);
    }
    this.insertarUsuario=function(usuario,callback){
        insertar(this.usuarios,usuario,callback);
    }
    this.actualizarUsuario = function(obj, callback) {
    actualizar(this.usuarios, obj, callback); 
    }
    this.insertarLog = function(registro, callback) {
        insertarLog(this.logs, registro, callback);
    }
    this.obtenerLogs = function(callback) {
        obtenerLogs(this.logs, callback);
    }
    
    this.sumarMonedas = function(email, cantidad, callback) {
        sumarMonedas(this.usuarios, email, cantidad, callback);
    }

    function actualizar(coleccion, obj, callback) {
        coleccion.findOneAndUpdate(
            { _id: ObjectId(obj._id) }, 
            { $set: obj }, 
            { upsert: false, returnDocument: "after", projection: { email: 1 } }, 
            function(err, doc) {
                if (err) { throw err; }
                else {
                    console.log("Elemento actualizado"); 
                    callback({ email: doc.value.email }); 
                }
            }
        );
    }
}
module.exports.CAD=CAD;