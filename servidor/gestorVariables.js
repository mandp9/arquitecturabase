const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function accessGMAIL_PASS() {
    // 1. PRIMERO: Comprobamos si la variable existe en local (.env)
    // Si existe (estás en tu PC), la devolvemos directamente y EVITAMOS llamar a Google.
    if (process.env.GMAIL_PASS) {
        return process.env.GMAIL_PASS;
    }

    // 2. SEGUNDO: Si no existe (estás en Cloud Run sin .env), llamamos a Secret Manager
    const name = 'projects/proyecto-procesos-475710/secrets/GMAIL_PASS/versions/1';
    try {
        const [version] = await client.accessSecretVersion({
            name: name,
        });
        const datos = version.payload.data.toString("utf8");
        return datos;
    } catch (error) {
        console.error("Error accediendo al Secret Manager:", error);
        return null;
    }
}

module.exports.obtenerOptions = async function(callback) { 
    let options = { user: "pirma.ba@gmail.com", pass: "" };
    
    let pass = await accessGMAIL_PASS(); 
    
    if (pass) {
        options.pass = pass; 
        callback(options); 
    } else {
        console.log("No se pudo obtener la contraseña de Gmail");
    }
}