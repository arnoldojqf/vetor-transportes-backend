const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('_helpers/send-email');
const Role = require('_helpers/role');
const fetchWrapper = require('_helpers/fetch-wrapper');
const tenantService = require('tenants/tenants.service');

const shippings = {}
const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectID;
const Excel = require('exceljs');
var claims = [];
var importedRoutes = [];

module.exports = {    
    importRoutes,
    importClaims,    
    update,    
};

async function getById(id) {
    const client = await new MongoClient(dbConfig.connectionString).connect();

    return client.db("vetor-transportes-backend").collection('shippings').findOne({ id: id });
}

async function update(filter, setData, upsert) {

    const client = await new MongoClient(dbConfig.connectionString).connect();

    if (upsert) {
        return await client.db("vetor-transportes-backend").collection('shippings').updateOne(filter, setData, { upsert: true });
    } else {
        return await client.db("vetor-transportes-backend").collection('shippings').updateOne(filter, setData);
    }    
}

async function importRoutes() {
    
    //console.log('config.tenantId', config.tenantId);

    const tenant = await tenantService.getById(config.tenantId);

    if (!tenant) {
        return null;
    }

    //console.log('tenant: ', tenant);

    const dataSource = tenant.dataSources.find(ds => ds.entity === "routes");

    if (!dataSource) {
        return null;
    }

    //console.log('dataSource: ', dataSource);

    importedRoutes = [];    

    const operations = dataSource.operations;

    //console.log('operations: ', operations);

    const url = "https://envios.mercadolivre.com.br/logistics/api/routes?sc=";

    for (const operation of operations) {        
        
        //const client = await new MongoClient(dbConfig.connectionString).connect();

        //console.log('url: ', url + operation);
        
        const routes = await fetchWrapper.get(url + operation);     
        
        console.log('routes: ', routes);

        for (const route of routes) {

            route.operation = operation;

            const updateDocument = {
                $set: route
            };
            
            await update({ id: route.id }, updateDocument, true);

            importedRoutes.push(route);

            await importRouteDetails(route.id);

            // client.db("vetor-transportes-backend").collection('shippings')
            // .updateOne(
            //     { id: route.id }, 
            //     updateDocument, 
            //     { upsert: true }, 
            //     async (err, item) => {
            //         if (err)
            //             return console.log('Erro ao inserir/atualizar a colecao shippings na DB: ', err);

            //         if (item)
            //             importedRoutes.push(route);
            //             await importRouteDetails(route.id);                
            //     }
            // );            
        }
    };    

    //console.log('imported routes: ', importedRoutes);

    return importedRoutes;
}

async function importRouteDetails(id) {
    //const client = await new MongoClient(dbConfig.connectionString).connect();

    const url = "https://envios.mercadolivre.com.br/logistics/api/routes/" + id;
    
    const detailsData = await fetchWrapper.get(url);

    const route = await getById(id);

    if(route){
        await update({ id:  id}, { $set: { details: detailsData }});
    }    
    
    // client.db("vetor-transportes-backend").collection('shippings').findOne({ id: id }, async function (err, item) {

    //     if (err)
    //         return console.log('Erro ao procurar na colecao shippings na DB: ', err);

    //     if (item)
    //         await update({ id:  id}, { $set: { details: detailsData }});
    // });        
}

async function importClaims() {
    //requiring path and fs modules
    const path = require('path');
    const fs = require('fs');
    //joining path of directory 
    const directoryPath = path.join(__dirname, 'data/claims_logistics');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, async function (err, files) {        
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using for loop
        for (const file of files) {
            if (path.extname(file) != ".xlsx")
                return;

            const filePath = path.join(directoryPath, file);
            
            // Do whatever you want to do with the file            
            await readClaimsFile(filePath);
        }
    });  

    //console.log('claims: ', claims);
    
    return claims;
}

async function readClaimsFile(filename){
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filename);

    claims = [];
        
    for (const sheet of workbook.worksheets) {
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
    }

    await saveClaims(claims);
}

async function saveClaims(claims) {    
    //const client = await new MongoClient(dbConfig.connectionString).connect();

    //await claims.forEach(async function(claim) {
    for (const claim of claims) {
        
        //const route = await client.db("vetor-transportes-backend").collection('shippings').findOne({ id: claim.ROUTE_ID });                

        // if(!route) {            
        //     const doc = {
        //         id: claim.ROUTE_ID,
        //         claims: [{claim}]
        //       }

        //     await client.db("vetor-transportes-backend").collection('shippings').insertOne(doc);
        // } else {
        //     console.log('update route id', claim.ROUTE_ID);            
            
        await update({ id: claim.id }, { $addToSet: { claimsData: claim.claims } }, true);
            // client.db("vetor-transportes-backend").collection('shippings').updateOne(
            //     { id: claim.id },
            //     { $addToSet: { claimsData: claim.claims } },
            //     { upsert: true },
            //     async function (err, item) {
            //         if (err)
            //             return console.log('Erro ao inserir/atualizar claims na DB: ', err);            
            // });
        //}                    
    }
}