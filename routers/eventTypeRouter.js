const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { eventTypeController } = require('../controllers/eventTypeController.js');
const eventTypeRouter = new Router();
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
} else {
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
eventTypeRouter.post('/add', upload.array('eventPhotos'), eventTypeController.addEvents);
eventTypeRouter.delete('/delete/:id', eventTypeController.deleteEvent);
eventTypeRouter.put('/:id', eventTypeController.updateStatus);
eventTypeRouter.put('/userPlace', eventTypeController.updateUserPlaceForEvent);
module.exports = { eventTypeRouter };