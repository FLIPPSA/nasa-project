const express = require('express');

const { httpGetAllLaunches, httpAddNewLaunch } = require('./launches.controller');
const { httpAbortLaunch } = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches); // matching the root of the path where the router has been mounted
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;