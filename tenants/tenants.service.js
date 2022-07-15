const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");

module.exports = {
    getById,
    save,
};

async function getById(id) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    return client.db("vetor-transportes-backend").collection('tenants').findOne({ id: id });
}

async function save(tenant) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    const updateDocument = {
        $set: tenant
        };
    
    await client.db("vetor-transportes-backend").collection('tenants').updateOne({ "id": tenant.id }, updateDocument, { upsert: true });                    
}