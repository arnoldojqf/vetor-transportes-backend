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
const Excel = require('exceljs');
var claims = [];

module.exports = {
    list,
    importRoutes,
    importClaims,
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
    
    const routes = await fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes?sc=SMG1");              

    await routes.forEach(async function(data) {        

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
    
    console.log('routes: ', routes);

    return routes;
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

async function importClaims() {
    //requiring path and fs modules
    const path = require('path');
    const fs = require('fs');
    //joining path of directory 
    const directoryPath = path.join(__dirname, 'data/claims_logistics');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {        
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(async function (file) {
            if (path.extname(file) != ".xlsx")
                return;

            const filePath = path.join(directoryPath, file);
            
            // Do whatever you want to do with the file            
            await readClaimsFile(filePath);
        });
    });  

    console.log('claims: ', claims);
    
    return claims;
}

async function readClaimsFile(filename){
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filename);

    claims = [];

    workbook.worksheets.forEach(function(sheet) {
        // read first row as data keys
        let firstRow = sheet.getRow(1);
        if (!firstRow.cellCount) return;
        let keys = firstRow.values;
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber == 1) return;
            
            let values = row.values;
            let claim = {};

            for (let i = 1; i < keys.length; i ++) {
                claim[keys[i]] = values[i];
            }

            let routeIdColIndex = keys.findIndex(x => x == 'ROUTE_ID');
            let routeId = values[routeIdColIndex];
            let existingRouteIndex = claims.findIndex(route => route.id == routeId);            

            if (existingRouteIndex != -1) {                                                
                claims[existingRouteIndex].claims.push(claim);
            } else {
                let route = {};
                route.id = "" + routeId + "";
                route.claims = [];
                route.claims.push(claim);
                claims.push(route);
            }            
        })
    }); 

    await saveClaims(claims);
}

async function saveClaims(claims) {    
    const client = await new MongoClient(dbConfig.connectionString).connect();

    await claims.forEach(async function(claim) {
        
        //const route = await client.db("vetor-transportes-backend").collection('shippings').findOne({ id: claim.ROUTE_ID });                

        // if(!route) {            
        //     const doc = {
        //         id: claim.ROUTE_ID,
        //         claims: [{claim}]
        //       }

        //     await client.db("vetor-transportes-backend").collection('shippings').insertOne(doc);
        // } else {
        //     console.log('update route id', claim.ROUTE_ID);            
            
            // validate
            client.db("vetor-transportes-backend").collection('shippings').updateOne(
                { id: claim.id },
                { $addToSet: { claimsData: claim.claims } },
                { upsert: true },
                async function (err, item) {
                    if (err)
                        return console.log('Erro ao inserir/atualizar claims na DB: ', err);            
            });
        //}                    
    });
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