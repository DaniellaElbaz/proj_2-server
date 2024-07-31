const { Router } = require('express');
const { userHomePageController } = require('../controllers/userHomePageController.js');

const userHomePageRouter = new Router();

userHomePageRouter.post('/', userHomePageController.insertReport);
userHomePageRouter.get('/', userHomePageController.getUsersInEvent);

module.exports = { userHomePageRouter };