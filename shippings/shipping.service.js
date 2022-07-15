const config = require('config.json');
const fetchWrapper = require('_helpers/fetch-wrapper');
const tenantService = require('tenants/tenants.service');
const dbConfig = require('config.json');
const { MongoClient } = require("mongodb");
const Excel = require('exceljs');
var claims = [];
var workbook = new Excel.Workbook();

module.exports = {    
    importRoutes,
    importClaims,    
    update,    
    getById
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

    const tenant = await tenantService.getById(config.tenantId);

    if (!tenant) {
        return null;
    }

    const dataSource = tenant.dataSources.find(ds => ds.entity === "routes");

    if (!dataSource) {
        return null;
    }

    const operations = dataSource.operations;

    const url = new URL(dataSource.endpoint + "?sc=", dataSource.protocol + '://' + dataSource.domain).href;

    for (const operation of operations) {        
        const routes = await fetchWrapper.get(url + operation, dataSource.options);     

        for (const route of routes) {
            route.operation = operation;

            const updateDocument = {
                $set: route
            };
            
            await update({ id: route.id }, updateDocument, true);
            
            const detailsUrl = new URL(dataSource.endpoint, dataSource.protocol + '://' + dataSource.domain).href;
    
            const detailsData = await fetchWrapper.get(detailsUrl  + '/' + route.id, dataSource.options);

            await update({ id:  route.id}, { $set: { details: detailsData }}, true);
        }
    };

    return true;
}

async function importClaims() {
    const path = require('path');
    const fs = require('fs');

    const directoryPath = path.join(__dirname, 'data/claims_logistics');

    const files = await fs.promises.readdir(directoryPath);

    for (const file of files) {        
        if (path.extname(file) != ".xlsx")
            continue;

        const filePath = path.join(directoryPath, file);
        
        await workbook.xlsx.readFile(filePath);

        readClaimsFile(filePath);
    }
    
    await saveClaims(claims);
    
    return true;
}

function readClaimsFile(){        

    claims = [];
        
    for (const sheet of workbook.worksheets) {
        // read first row as data keys
        let firstRow = sheet.getRow(1);
        if (!firstRow.cellCount) return;
        let keys = firstRow.values;
        //console.log('sheet.rowCount : ', sheet.rowCount);  
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
}

async function saveClaims(claims) {    
    for (const claim of claims) {          
        await update({ id: claim.id }, { $addToSet: { claimsData: claim.claims } }, true);
    }
}