const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('_helpers/send-email');
const Role = require('_helpers/role');
const fetchWrapper = require('_helpers/fetch-wrapper');

const shippings = {}
const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    list,
    importRoutes,
    edit,
    update,
    _delete
};

async function list () {
  MongoClient.connect(dbConfig.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err)
    let db = client.db('vetor-transportes-backend')
    db.collection('shippings').find().toArray().then(function (docs) {
      client.close()
      res.send(docs)
    })
  })
}

async function importRoutes() {
    const client = await new MongoClient(dbConfig.connectionString).connect();
    
    const objects = await fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes?sc=SMG1");              

    await objects.forEach(async function(data) {        

        const updateDocument = {
            $set: data
         };
        
        // validate
        await client.db("vetor-transportes-backend").collection('shippings').updateOne({ id: data.id }, updateDocument, { upsert: true }, async function (err, item) {

            if (err)
                return console.log('Erro ao inserir/atualizar a colecao shippings na DB: ', err);

            if (item)
                importRouteDetails(data.id);                
        });            
    });    

    //await client.close();
    
    return objects.length;
}

async function importRouteDetails(id) {
    const client = await new MongoClient(dbConfig.connectionString).connect();
    
    const detailsData = await fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes/" + id);
    
    // validate
    await client.db("vetor-transportes-backend").collection('shippings').findOne({ id: id }, async function (err, item) {

        if (err)
            return console.log('Erro ao procurar na colecao shippings na DB: ', err);

        if (item)
            await update({ id:  id}, { $set: { details: detailsData }});
    });
    
    return detailsData.length;
}

async function edit() {
  let id = req.params.id
  MongoClient.connect(dbConfig.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err)
    let db = client.db('vetor-transportes-backend')
    db.collection('shippings').find({ '_id': ObjectId(id) }).toArray().then(function (docs) {
      client.close()
      res.send(docs)
    })
  })
}

async function update(whereQuery, setData) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    await client.db("vetor-transportes-backend").collection('shippings').updateOne(whereQuery, setData, function (err, docs) {
        if (err) return console.log('Error updating data to DB: ', err);
      });
}

async function _delete() {
  let id = req.params.id
  MongoClient.connect(dbConfig.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err)
    let db = client.db('vetor-transportes-backend')
    let whereQuery = { _id: ObjectId(id) }
    db.collection('shippings').deleteOne(whereQuery, function (err, docs) {
      if (err) return console.log(err)
      client.close()
      res.send(docs)
    })
  })
}