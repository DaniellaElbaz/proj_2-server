const { Router } = require('express');
const { eventLiveController } = require('../controllers/eventLiveController.js');

const eventLiveRouter = new Router();

eventLiveRouter.get('/:eventId', eventLiveController.getLiveReports);
eventLiveRouter.post('/', eventLiveController.insertToUser);
module.exports = { eventLiveRouter };