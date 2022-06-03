const express = require('express');
const router = express.Router();
const authorize = require('_middleware/authorize')
const reportsService = require('./reports.service');

// routes
router.get('/logistics-analitico', authorize(), getLogisticsAnalitico);

module.exports = router;

function getLogisticsAnalitico(req, res, next) {
    reportsService.getLogisticsAnalitico()
        .then(data => res.json(data))
        .catch(next);
}