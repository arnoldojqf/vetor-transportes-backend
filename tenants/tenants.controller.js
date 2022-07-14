const express = require('express');
const router = express.Router();
const tenantService = require('./tenants.service');

// routes
router.get('/:id', getById);
router.post('/', save);

module.exports = router;

function getById(req, res, next) {
    console.log('getById: ', req.params.id);

    tenantService.getById(req.params.id)
            .then(data => res.json(data))
            .catch(next);
}

function save(req, res, next) {
    console.log('save: ', req.body);

    tenantService.save(req.body)
        .then(data => res.json(data))
        .catch(next);
}