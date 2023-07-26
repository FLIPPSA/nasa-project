// Just another type of middleware that groups together related routes
const express = require('express');

const { httpGetAllPlanets } = require('./planets.controller');

const planetsRouter = express.Router(); // On this Router you can define all your routes

planetsRouter.get('/', httpGetAllPlanets);

//To use the router you need to export it from this module
module.exports = planetsRouter;