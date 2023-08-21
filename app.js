require('module-alias/register');
require('module-alias').addPath('.');
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

// Keep requestCorrelationId middleware as the first middleware. Otherwise we risk losing logs.
const requestCorrelationMiddleware = require('middlewares/requestCorrelationId.js'); // eslint-disable-line id-length
const camelCaseReqMiddleware = require('middlewares/camelCaseRequest.js').camelCaseRequest;
const errorHandleMiddleware = require('middlewares/errorHandling.js');

const logger = require('utils/logger.js');

const ethereumd = require('routes/v1/ethereumd/info.js');
const charts = require('routes/v1/ethereumd/charts.js');
const system = require('routes/v1/ethereumd/system.js');
const ping = require('routes/ping.js');
const app = express();

// Handles CORS
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(requestCorrelationMiddleware);
app.use(camelCaseReqMiddleware);
app.use(morgan(logger.morganConfiguration));

app.use('/', express.static('./ui/dist'));

app.use('/v1/ethereumd/info', ethereumd);
app.use('/v1/ethereumd/info', charts);
app.use('/v1/ethereumd/system', system);
app.use('/ping', ping);

app.use(errorHandleMiddleware);
app.use((req, res) => {
  res.status(404).json(); // eslint-disable-line no-magic-numbers
});

module.exports = app;
