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

module.exports = {
    getLogisticsAnalitico
};

// const toTimestamp = (strDate) => {  
//     const dt = Date.parse(strDate);  
//     return dt / 1000;  
//   }

// const toTimestamp = (strDate) => {  
//     const dt = new Date(strDate).getTime();  
//     return dt / 1000;  
//   }

const toTimestamp = (date) => {  
    const dt = date.getTime();  
    return dt / 1000;  
}

async function getLogisticsAnalitico() {
    try {
        const client = await new MongoClient(dbConfig.connectionString).connect();

        return await client.db("vetor-transportes-backend").collection('shippings').find(
            {            
                initDate: {
                    $gte: toTimestamp(new Date(new Date().setHours(00, 00, 00))),
                    $lte: toTimestamp(new Date(new Date().setHours(23, 59, 59))),
                },
            });        
      } catch (err) {
        console.error(`Error on reports.service.list(): ${err}`);
      }
}