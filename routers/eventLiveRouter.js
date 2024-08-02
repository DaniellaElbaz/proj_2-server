const { Router } = require('express');
const { eventLiveController } = require('../controllers/eventLiveController.js');

const eventLiveRouter = new Router();

eventLiveRouter.get('/', eventLiveController.getLiveReports);
module.exports = { eventLiveRouter };