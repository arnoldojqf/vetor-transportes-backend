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
}

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
    let result = [];
        
    try {
        const client = await new MongoClient(dbConfig.connectionString).connect();

        const pipeline = [
            {
                $group :
                { 
                    _id : {
                        facilityId: "$facilityId", 
                        dtInitDate: { 
                            $dateToString : { 
                                format: "%Y-%m-%d", 
                                date: {
                                    "$toDate": {"$toLong": { $multiply: [ "$initDate", 1000 ] } } 
                                }
                            }
                        },
                    }, 
                    shipments: {
                        $push: {
                            facilityId: "$facilityId",
                            driverName: "$driver.driverName",
                            carrier: "$carrier",
                            initDate: "$initDate",
                            dtInitDate: { 
                                $dateToString : { 
                                    format: "%Y-%m-%d", 
                                    date: {
                                        "$toDate": {"$toLong": { $multiply: [ "$initDate", 1000 ] } } 
                                    }
                                }
                            },
                            dtFinalDate: {
                                $dateToString : { 
                                    format: "%Y-%m-%d", 
                                    date: { 
                                        "$toDate": {"$toLong": { $multiply: [ "$finalDate", 1000 ] } } 
                                    }
                                }
                            },
                            total : "$counters.total",
                            delivered : "$counters.delivered",
                            notDelivered : "$counters.notDelivered",
                            pending : "$counters.pending",
                        } 
                    }
                }
            },
            { 
                $match: {
                    "shipments.initDate": {
                        $gte: toTimestamp(new Date(new Date().setHours(00, 00, 00))),
                        $lte: toTimestamp(new Date(new Date().setHours(23, 59, 59))),
                    },
                } 
            },
            { $unwind: "$shipments" },   
            { $replaceRoot: { newRoot: "$shipments" } }
            // { 
            //     $project : { 
            //     _id : 0, 
            //     facilityId: "$shipments.facilityId",
            //     // "shipments.driverName": 1,
            //     // "shipments.carrier": 1,
            //     // "shipments.initDate": 1,
            //     // "shipments.dtInitDate": 1,
            //     // "shipments.dtFinalDate": 1,
            //     // "shipments.total" : 1,
            //     // "shipments.delivered" : 1,
            //     // "shipments.notDelivered" : 1,
            //     // "shipments.pending" : 1,
            //     } 
            // },
            // {
            //     $addFields: {                                        
            //         dtFinalDate: { "$toDate": {"$toLong": { $multiply: [ "$finalDate", 1000 ] } } },
            //         total : { $sum: "$counters.total" },
            //         delivered : { $sum: "$counters.delivered" },
            //         notDelivered : { $sum: "$counters.notDelivered" },
            //         pending : { $sum: "$counters.pending" },
            //     }
            // }
        ];

        result = await client.db("vetor-transportes-backend").collection('shippings').aggregate(pipeline).toArray();

        console.log('result', result);

      } catch (err) {
        console.error(`Error on reports.service.list(): ${err}`);
      }      

      return result;
}