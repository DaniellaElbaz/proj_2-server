const { Router } = require('express');
const { eventTypeController } = require('../controllers/eventTypeController.js');

const eventTypeRouter = new Router();
eventTypeRouter.get('/', eventTypeController.getEventTypeName);

module.exports = { eventTypeRouter };