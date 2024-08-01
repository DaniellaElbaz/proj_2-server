const { Router } = require('express');
const { eventLiveController } = require('../controllers/eventLiveController.js');

const eventLiveRouter = new Router();

// שינוי המסלול כך שיכלול את userId כפרמטר ב-URL
eventLiveRouter.get('/:userId', eventLiveController.getLiveReports);

module.exports = { eventLiveRouter };
