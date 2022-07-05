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
                $match: {
                    "initDate": {
                        $gte: toTimestamp(new Date(new Date().setHours(00, 00, 00))),
                        $lte: toTimestamp(new Date(new Date().setHours(23, 59, 59))),
                    }
                } 
            },                           
            {
                $project : {
                    driverName: "$driver.driverName", 
                    dtInitDate: { 
                        $dateToString : { 
                            format: "%Y-%m-%d", 
                            date: {
                                "$toDate": {"$toLong": { $multiply: [ "$initDate", 1000 ] } } 
                            }
                        }
                    },                        
                    facilityId: "$facilityId",
                    routeId: "$id",                        
                    carrier: "$carrier",                            
                    strInitDate: { 
                        $dateToString : { 
                            format: "%d/%m/%Y %H:%M:%S", 
                            date: {
                                "$toDate": {"$toLong": { $multiply: [ "$initDate", 1000 ] } }
                            }
                        }
                    },
                    hourInitDate: { 
                        $toInt: { 
                            $dateToString : { 
                                format: "%H", 
                                date: {
                                    "$toDate": {"$toLong": { $multiply: [ "$initDate", 1000 ] } }
                                }
                            }
                        }
                    },
                    total: "$counters.total",
                    delivered: "$counters.delivered",
                    notDelivered: "$counters.notDelivered",
                    pending: "$counters.pending",
                    orh: "$timingData.orh",
                    stops: "$details.stops"
                }                
            },
            {
                $addFields: {                                      
                   "ds": { $cond: { if: { $eq:  ["$total", 0] }, then: 0, else: { $divide: [ "$delivered", "$total" ] } } },                   
                   "pnr": { $cond: { if: { $eq:  ["$total", 0] }, then: 0, else: { $divide: [ "$delivered", "$total" ] } } }, // claims
                   "cycle": { 
                        $cond: { 
                            if: { $lte: [ "$hourInitDate" , 13 ] }, 
                                then: "AM", else: "PM" 
                        }                                
                    },
                }
            },
            {
                $addFields: {
                   "orhMax": { $cond: { if: { $eq: [ "$cycle", "AM" ] }, then: 528, else: 360 } },
                }
            },
            {
                $group :
                { 
                    _id : {
                        driverName: "$driverName", 
                        dtInitDate: "$dtInitDate",
                        
                    }, 
                    routes: { $sum: 1 },
                    totalPackages: { $sum: "$total" },
                    shipments: {
                        $push:  "$$ROOT"
                    },
                }                
            },
            { $unwind: "$shipments" },
            {
                $addFields: {
                   "shipments.routes": "$routes",
                   "shipments.spr": { $cond: { if: { $eq:  ["$routes", 0] }, then: 0, else: { $divide: [ "$totalPackages", "$routes" ] } } },
                }
            },            
            { $group : { _id : "$shipments" } },
            { $replaceRoot: { newRoot: "$_id" } },
            { $unwind: "$stops" },
            { $unwind: "$stops.orders" },
            { $unwind: "$stops.orders.transportUnits" },
            {
                $addFields: {
                  "stops.orders.transportUnits.shipment.dtInitDate": {
                    "$toDate": {
                      "$toLong": {
                        $multiply: [
                          "$stops.orders.transportUnits.shipment.timestamp",
                          1000
                        ]
                      }
                    }
                  },
                  
                }
            },
            {
                $setWindowFields: {
                  partitionBy: null,
                  sortBy: {
                    "stops.orders.transportUnits.shipment.dtInitDate": 1
                  },
                  output: {
                    deliveredPerHour: {
                      $count: {},
                      window: {
                        range: [ "unbounded", 60 ],
                        unit: "minute"
                      }
                    }
                  }
                }
            },            
            {
                $unset: "stops"
            },
            {
                $group: {
                    _id: {
                        driverName: "$driverName",
                        dtInitDate: "$dtInitDate",                
                    },
                    sumDeliveredPerHour: { $sum: "$deliveredPerHour" },
                    shipments: {
                        $push: "$$ROOT"
                    }
                }
            },            
            { $unwind: "$shipments" },
            {
                $unset: "shipments.deliveredPerHour"
            },
            {
                $addFields: {
                   "shipments.dpph": { $cond: { if: { $eq:  ["$shipments.orh", 0] }, then: 0, else: { $divide: [ "$sumDeliveredPerHour", "$shipments.orh" ] } } },
                }
            },            
            {
                $group: {
                    _id: "$shipments"
                }
            },
            { $replaceRoot: { newRoot: "$_id" } }
        ];

        result = await client.db("vetor-transportes-backend").collection('shippings').aggregate(pipeline).toArray();

        console.log('result', result);

      } catch (err) {
        console.error(`Error on reports.service.list(): ${err}`);
      }      

      return result;
}