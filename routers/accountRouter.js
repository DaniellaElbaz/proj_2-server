const { Router } = require('express');
const { accountController } = require('../controllers/accountController.js');

const accountRouter = new Router();

accountRouter.post('/login', accountController.login);
accountRouter.put('/', accountController.updateUserPlace);
module.exports = { accountRouter };
