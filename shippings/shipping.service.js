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
    save,
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

async function create() {

    const params = fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes?sc=SMG1");

    params.forEach(function(data) {  
        
        //console.log(data);
        // validate
        db.Shipping.findOne({ id: data.id }, function (err, doc) {
            if (err){
                console.log(err);
            }
            else{
                let shipping = new db.Shipping(data);
                // save shipping
                shipping.save();
            }
        });
    });        

    return basicDetails(params);
}

function basicDetails(shipping) {
    const { id, type, linehaulId, cluster, carrier, dateFirstMovement, status, hasHelper, hasPlaces, hasBulky, substatus, deliveryType, facilityId, facilityType, initDate, finalDate, created, updated } = shipping;
    return { id, type, linehaulId, cluster, carrier, dateFirstMovement, status, hasHelper, hasPlaces, hasBulky, substatus, deliveryType, facilityId, facilityType, initDate, finalDate, created, updated };
}

async function save() {
    const client = await new MongoClient(dbConfig.connectionString).connect();
    
    //const db = MongoClient.connect(dbConfig.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

  //let data = req.body.data   
    const objects = await fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes?sc=SMG1");              

    console.log('objects', objects);

    await objects.forEach(async function(data) {          
        //console.log(data);                                    

        //const db = client.db('vetor-transportes-backend');

        // validate
        await client.db("vetor-transportes-backend").collection('shippings').findOne({ id: data.id }, async function (err, item) {

            if (err)
                return console.log('Erro ao procurar shipping na DB: ', err);

            if (item)
                return console.log('Item existente: ', item);

            await client.db("vetor-transportes-backend").collection('shippings').insertOne(data, function (err, r) {
                if (err)
                    return console.log('Erro ao inserir shipping na DB: ', err);                    
            });
        });            
    });                        

    //await client.close();
    
    return objects;
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

async function update() {
  let id = req.params.id
  let data = req.body.data
  MongoClient.connect(dbConfig.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err)
    let db = client.db('vetor-transportes-backend')
    let whereQuery = { _id: ObjectId(id) }
    let setData = { $set: data }
    db.collection('shippings').updateOne(whereQuery, setData, function (err, docs) {
      if (err) return console.log(err)
      client.close()
      res.send(docs)
    })
  })
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