const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function accessGMAIL_PASS() {
    const name = 'projects/proyecto-procesos-475710/secrets/GMAIL_PASS/versions/1';
    const [version] = await client.accessSecretVersion({
    name: name,
    });
    const datos=version.payload.data.toString("utf8");
    return datos;
}
async function accessGMAIL_USER() {
    const name = 'projects/proyecto-procesos-475710/secrets/GMAIL_USER/versions/1';
    try {
        const [version] = await client.accessSecretVersion({ name: name });
        return version.payload.data.toString("utf8");
    } catch (error) {
        console.error("Error accediendo a GMAIL_USER:", error);
        return null;
    }
}

module.exports.obtenerOptions = async function(callback) { 
    let options = { user: "pirma.ba@gmail.com", pass: "" };
    let pass = await accessGMAIL_PASS(); 
    options.pass = pass; 
    callback(options); 
}