const schedule = require('node-schedule');
const shippingService = require('shippings/shipping.service');

module.exports = {
    importRoutes
};

function importRoutes() {

    console.log('Trying to schedule the importRoutes Job');

    const job = schedule.scheduleJob('0 * * * * *', function() {    

    shippingService.importRoutes()
            .then((result) => 
                {
                    console.log('importRoutes Job run succesfully: ', result);                    
                }).catch((err) => {
                    console.log('Error on running Job importRoutes: ', err);
                });    
    });

    console.log('Job importRoutes successfully scheduled');
}

// function importRouteDetails() {

//     console.log('Trying to schedule the importRouteDetails Job');

//     const job = schedule.scheduleJob('30 * * * * *', function() {    

//     shippingService.importRouteDetails()
//             .then((result) => 
//                 {
//                     console.log('importRouteDetails Job run succesfully: ', result);                    
//                 }).catch((err) => {
//                     console.log('Error on running Job importRouteDetails: ', err);
//                 });    
//     });

//     console.log('Job importRouteDetails successfully scheduled');
// }