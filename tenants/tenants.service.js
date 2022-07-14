const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");

module.exports = {
    getById,
    save,
};

async function getById(id) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    console.log('getById: ', id);

    return await client.db("vetor-transportes-backend").collection('tenants')
        .findOne(
            { id: id }, 
            // (err, item) => {
            //     if (err)
            //         return console.log('Erro ao obter da colecao tenants na DB: ', err);                
            // }
        );        
}

async function save(tenant) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    const updateDocument = {
        $set: tenant
        };
    
    await client.db("vetor-transportes-backend").collection('tenants')
        .updateOne(
            { "id": tenant.id }, 
            updateDocument, 
            { upsert: true }, 
            async function (err, item) {
                if (err)
                    return console.log('Erro ao inserir/atualizar a colecao settings na DB: ', err);

                return item;
            }
        );                    
}