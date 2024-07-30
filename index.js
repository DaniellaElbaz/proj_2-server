require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 8081;
const {weatherRouter} = require('./routers/weatherRouter.js');
const { eventHistoryRouter } = require('./routers/eventHistoryRouter.js');
const { accountRouter } = require('./routers/accountRouter.js');
const { madaHomePageRouter } = require('./routers/madaHomePageRouter.js');
const { eventTypeRouter } = require('./routers/eventTypeRouter.js');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': "GET, POST, PUT, DELETE",
        'Content-Type': 'application/json'
    });
    next();
});
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created images directory at: ${imagesDir}`);
} else {
    console.log(`Images directory exists at: ${imagesDir}`);
}
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(`Saving file to: ${imagesDir}`);
            cb(null, imagesDir);
        },
        filename: function (req, file, cb) {
            console.log(`Saving file as: ${file.originalname}`);
            cb(null, file.originalname);
        }
    })
});
app.set('io', io);
app.use('/api/weather', weatherRouter);
app.use('/api/eventType', eventTypeRouter);
app.use('/api/eventHistory', eventHistoryRouter);
app.use('/api/account', accountRouter);
app.use('/api/madaHomePage', madaHomePageRouter);
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));
app.use((req, res) => {
    console.error('Path not found:', req.path);
    res.status(400).send('something is broken!');
});
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});