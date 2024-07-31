const { Router } = require('express');
const { eventHistoryController } = require('../controllers/eventHistoryController.js');

const eventHistoryRouter = new Router();
eventHistoryRouter.get('/', eventHistoryController.getEventHistory);
eventHistoryRouter.get('/eventStats', eventHistoryController.getEventByTypeEndDate);
module.exports = { eventHistoryRouter };