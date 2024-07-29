const { Router } = require('express');
const multer = require('multer');
const { eventTypeController } = require('../controllers/eventTypeController.js');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Saving file to images/ directory');
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        console.log('Saving file as:', filename);
        cb(null, filename);
    }
});

const upload = multer({ storage });
const eventTypeRouter = new Router();
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
eventTypeRouter.post('/add', upload.array('eventPhotos', 10), eventTypeController.addEvents);
module.exports = { eventTypeRouter };