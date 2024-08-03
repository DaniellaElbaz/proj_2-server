const { Router } = require('express');
const { eventLiveController } = require('../controllers/eventLiveController.js');

const eventLiveRouter = new Router();

eventLiveRouter.get('/:eventId', eventLiveController.getLiveReports);
eventLiveRouter.post('/',eventLiveController.insertToUser);
eventLiveRouter.put('/', eventLiveController.updateUserPlace);
module.exports = { eventLiveRouter };