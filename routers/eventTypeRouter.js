const { Router } = require('express');
const multer = require('multer');
const { eventTypeController } = require('../controllers/eventTypeController.js');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const upload = multer({ storage });
const eventTypeRouter = new Router();
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
eventTypeRouter.post('/add', upload.array('eventPhotos', 10), eventTypeController.addEvents);
module.exports = { eventTypeRouter };