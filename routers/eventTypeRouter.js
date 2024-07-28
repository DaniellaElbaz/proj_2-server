const { Router } = require('express');
const { eventTypeController } = require('../controllers/eventTypeController.js');

const eventTypeRouter = new Router();
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
module.exports = { eventTypeRouter };