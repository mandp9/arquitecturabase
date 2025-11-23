const {SecretManagerServiceClient} = require('@google-cloud/secretmanager');

const client = new SecretManagerServiceClient();

async function accessGMAIL_PASS() {
    const name = 'projects/proyecto-procesos-475710/secrets/GMAIL_PASS/versions/1';
    const [version] = await client.accessSecretVersion({
    name: name,
    });
    const datos=version.payload.data.toString("utf8");
    return datos;
}