const schedule = require('node-schedule');
const shippingService = require('shippings/shipping.service');

module.exports = {
    importLogistics
};

function importLogistics() {

    console.log('Trying to schedule the importLogistics Job');

    const job = schedule.scheduleJob('0 * * * * *', function() {    

    shippingService.save()
            .then((result) => 
                {
                    console.log('importLogistics Job run succesfully: ', result);                    
                }).catch((err) => {
                    console.log('Error on running Job importLogistics: ', err);
                });    
    });

    console.log('Job importLogistics successfully scheduled');
}