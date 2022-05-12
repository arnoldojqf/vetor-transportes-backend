const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');
const fetchWrapper = require('_helpers/fetch-wrapper');

module.exports = {
    create
};

async function create() {

    const params = await fetchWrapper.get("https://envios.mercadolivre.com.br/logistics/api/routes?sc=SMG1");

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