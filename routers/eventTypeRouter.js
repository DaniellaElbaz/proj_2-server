const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { eventTypeController } = require('../controllers/eventTypeController.js');
const eventTypeRouter = new Router();


const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created images directory at: ${imagesDir}`);
} else {
    console.log(`Images directory exists at: ${imagesDir}`);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(`Saving file to: ${imagesDir}`);
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        console.log(`Saving file as: ${filename}`);
        cb(null, filename);
    }
});


const upload = multer({ storage });
eventTypeRouter.get('/', eventTypeController.getEventTypeName);
eventTypeRouter.get('/MDA', eventTypeController.getEventMDAEvents);
eventTypeRouter.post('/add', upload.array('eventPhotos'), eventTypeController.addEvents);
module.exports = { eventTypeRouter };