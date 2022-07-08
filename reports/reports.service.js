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
            // { 
            //     $match: {
            //         "initDate": {
            //             $gte: toTimestamp(new Date(new Date().setHours(00, 00, 00))),
            //             $lte: toTimestamp(new Date(new Date().setHours(23, 59, 59))),
            //         }
            //     } 
            // },                           
            {
                $project : {
                    driverName: "$driver.driverName", 
                    tsInitDate: { "$toLong": { $multiply: [ "$initDate", 1000 ] } }, 
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
                    stops: "$details.stops",
                    claimsData:"$claimsData"
                }                
            },
            {
                $addFields: {                                      
                   "ds": { 
                            $cond: { 
                                if: { $eq:  ["$total", 0] }, 
                                then: 0,
                                else: { $divide: [ "$delivered", "$total" ] } 
                            } 
                        },                   
                   "pnr": { 
                            $cond: { 
                                if: { $eq:  ["$total", 0] }, 
                                then: 0, 
                                else: { $divide: [ "$delivered", "$total" ] } 
                            } 
                        }, // claims
                   "cycle": { 
                        $cond: { 
                            if: { $lte: [ "$hourInitDate" , 13 ] }, 
                            then: "AM", 
                            else: "PM" 
                        }                                
                    },
                }
            },
            {
                $addFields: {
                   "orhMax": { 
                                $cond: { 
                                    if: { $eq: [ "$cycle", "AM" ] }, 
                                    then: 528, 
                                    else: 360 
                                } 
                            },
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
            { $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                   "shipments.routes": "$routes",
                   "shipments.spr": { 
                                        $cond: { 
                                            if: { $eq:  ["$routes", 0] }, 
                                            then: 0, 
                                            else: { $divide: [ "$totalPackages", "$routes" ] } 
                                        } 
                                    },
                }
            },            
            { $group : { _id : "$shipments" } },
            { $replaceRoot: { newRoot: "$_id" } },
            { $unwind: { path: "$stops", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$stops.orders", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$stops.orders.transportUnits", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                  "stops.orders.transportUnits.shipment.dtInitDate": {
                    "$toDate": {
                      "$toLong": {
                        $multiply: [
                            { $ifNull: ["$stops.orders.transportUnits.shipment.timestamp", 0] },
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
            { $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true } },
            {
                $unset: "shipments.deliveredPerHour"
            },
            {
                $addFields: {
                   "shipments.dpph": { 
                        $cond: { 
                            if: { $eq:  ["$shipments.orh", 0] }, 
                            then: 0,
                            else: { $divide: [ "$sumDeliveredPerHour", "$shipments.orh" ] } 
                        } 
                    },
                }
            },            
            {
                $group: { _id: "$shipments" }
            },
            { $replaceRoot: { newRoot: "$_id" } },
            { $unwind: { path: "$claimsData", preserveNullAndEmptyArrays: true } },
            { 
                $addFields: { 
                    claimsData: { 
                        $map: { 
                            input: "$claimsData", 
                            as: "claim", 
                            in: {
                                $mergeObjects: [ 
                                    "$$claim",  
                                    { 
                                        dtClaimOpen: { 
                                            $dateToString : { format: "%d/%m/%Y %H:%M:%S", date: "$$claim.CLAIM_OPENED_DATE" }
                                        } 
                                    }
                                ]
                            }
                        }
                    },
                    cntClaims: { 
                        $cond:
                        {
                          if: { $isArray: "$claimsData" },
                          then: { $size:"$claimsData" },
                          else: 0
                        }
                    },                   
                }
            },
            {
                $addFields: {
                    contactRate: { 
                        $cond:
                        {
                          if: { $eq: ["$total", 0] },
                          then: 0,
                          else: { $divide: ["$cntClaims", "$total"] }
                        }
                    },
                }
            }
        ];

        result = await client.db("vetor-transportes-backend").collection('shippings').aggregate(pipeline, { allowDiskUse: true }).toArray();

        console.log('result', result);

      } catch (err) {
        console.error(`Error on reports.service.list(): ${err}`);
      }      

      return result;
}