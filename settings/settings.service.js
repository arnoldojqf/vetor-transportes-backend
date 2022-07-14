const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");

module.exports = {
    getByTenantId,
    saveByTenantId,
};

async function getByTenantId(tenantId) {
    const client = await new MongoClient(dbConfig.connectionString).connect();
    
    await client.db("vetor-transportes-backend").collection('settings')
        .findOne(
            { "tenants.id": tenantId }, 
            async function (err, item) {

                if (err)
                    return console.log('Erro ao procurar na colecao settings na DB: ', err);
            }
        );
    
    return detailsData.length;
}

async function saveByTenantId(settingDoc) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    const updateDocument = {
        $set: settingDoc
        };
    
    // validate
    await client.db("vetor-transportes-backend").collection('settings')
        .updateOne(
            { "tenants.id": setting.tenantId }, 
            updateDocument, 
            { upsert: true }, 
            async function (err, item) {

                if (err)
                    return console.log('Erro ao inserir/atualizar a colecao settings na DB: ', err);
            }
        );            

    //await client.close();

    return routes;
}