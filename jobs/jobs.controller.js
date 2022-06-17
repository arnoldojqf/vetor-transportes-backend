const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const shippingService = require('shippings/shipping.service');

// routes
router.post('/importRoutes', importRoutes);
router.post('/importClaims', importClaims);

module.exports = router;

function importRoutes(req, res, next) {
    shippingService.importRoutes()
            .then(data => res.json(data))
            .catch(next);
}

function importClaims(req, res, next) {
    shippingService.importClaims()
        .then(data => res.json(data))
        .catch(next);
}