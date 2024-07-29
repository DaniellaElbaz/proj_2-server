const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { eventTypeController } = require('../controllers/eventTypeController.js');
const eventTypeRouter = new Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
eventTypeRouter.post('/add', upload.array('eventPhotos'), eventTypeController.addEvents);
module.exports = { eventTypeRouter };