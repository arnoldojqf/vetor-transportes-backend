const express = require('express');
const router = express.Router();
const tenantService = require('./tenants.service');

// routes
router.get('/:id', getById);
router.post('/', save);

module.exports = router;

function getById(req, res, next) {    
    tenantService.getById(req.params.id)
            .then(data => res.json(data))
            .catch(next);
}

function save(req, res, next) {
    tenantService.save(req.body)
        .then(data => res.json(data))
        .catch(next);
}