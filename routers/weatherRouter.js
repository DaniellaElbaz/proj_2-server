const { Router } = require('express');
const { weatherController } = require('../controllers/weatherController.js');

const weatherRouter = new Router();

weatherRouter.get('/', weatherController.fetchWeatherData);
module.exports = { weatherRouter };