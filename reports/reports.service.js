const { MongoClient } = require("mongodb");
const { uri } = require("_helpers/mongoClient");

module.exports = {
    getLogisticsAnalitico
}

const toTimestamp = (date) => {  
    const dt = date.getTime();  
    return dt / 1000;  
}

async function getLogisticsAnalitico() {
    let result = [];
        
    try {
        const client = await new MongoClient(uri).connect();

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
                    operation: "$operation",                        
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
                                then: "0%",
                                else: { $concat: [ { $substr: [ { $multiply: [ { $divide: [ "$delivered", "$total" ] }, 100] }, 0, 4 ] }, "%" ] }
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
                            if: { $gt: [ "$hourInitDate" , 12 ] }, 
                            then: "PM", 
                            else: "AM" 
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
                $addFields: {
                   "pOrh": { $concat: [ { $substr: [ { $multiply: [ { $divide: [ "$orh", "$orhMax" ] }, 100] }, 0, 4 ] }, "%" ] },
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
            { $addFields: { "deliveryStatus": { $trim: { input: "$stops.orders.transportUnits.shipment.substatus" } } } },
            { $match: { "deliveryStatus" : { $eq: "delivered" } } },
            {
                $addFields: {
                    "dtDelivery": {
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
                $group: {
                    _id: {
                      routeId: "$routeId",
                    },
                    fisrtDateDeliveryByDay: { $min: "$dtDelivery" },
                    shipments: {$push: "$$ROOT"}
                }
            },
            {
                $addFields: {
                    "shipments.fisrtDateDeliveryByDay": "$fisrtDateDeliveryByDay",
                  }
            },
            { $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$shipments", } },
            { $replaceRoot: { newRoot: "$_id" } },
            {
                $group: {
                    _id: {
                      routeId: "$routeId",
                      interval: {
                        $subtract: [
                          "$dtDelivery",
                            {
                              $mod: [
                                {
                                  $subtract: [
                                        "$dtDelivery",
                                        "$fisrtDateDeliveryByDay"
                                        ]
                                }
                                ,
                                60 * 60 * 1000,
                              ]
                            }
                          ]
                      }
                    },
                    deliveredPerHour: { $sum: 1 },
                    shipments: {$push: "$$ROOT"}
                }
            },       
            {
                $addFields: {
                    "shipments.deliveredPerHour": "$deliveredPerHour",
                  }
            },
            { $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true } },
            { $group: { _id: "$shipments", } },
            { $replaceRoot: { newRoot: "$_id" } },
            {
                $group:
               {
                 _id: "$routeId",
                  dpph: { $avg: "$deliveredPerHour" },
                  shipments: {$push: "$$ROOT"}
               }
            },
            {
                $addFields: {                    
                    "shipments.dpph": { $substr: ["$dpph" , 0, 4 ] }
                  }
            },    
            { $unwind: { path: "$shipments", preserveNullAndEmptyArrays: true } },
            { $unset: ["shipments.stops","shipments.dtDelivery","shipments.fisrtDateDeliveryByDay","shipments.deliveredPerHour","shipments.deliveryStatus"] },
            { $group: { _id: "$shipments", } },
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