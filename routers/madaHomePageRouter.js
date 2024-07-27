const { Router } = require('express');
const { madaHomePageController } = require('../controllers/madaHomePageController.js');

const madaHomePageRouter = new Router();

madaHomePageRouter.get('/', madaHomePageController.getNotification);

module.exports = { madaHomePageRouter };