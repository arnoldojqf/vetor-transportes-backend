require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const schedule = require('_helpers/schedule');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/reports', require('./reports/reports.controller'));
app.use('/jobs', require('./jobs/jobs.controller'));
app.use('/tenants', require('./tenants/tenants.controller'));

// swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// schedule jobs
// schedule.importRoutes();
// schedule.importClaims();

// start server
//const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const port = process.env.PORT;
app.listen(port, () => {
    console.log('Environment: ' + process.env.NODE_ENV);
    console.log('Server listening on port ' + port);
});
