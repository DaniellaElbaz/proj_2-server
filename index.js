require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 8081;
const {weatherRouter} = require('./routers/weatherRouter.js');
const { eventHistoryRouter } = require('./routers/eventHistoryRouter.js');
const { accountRouter } = require('./routers/accountRouter.js');
const { madaHomePageRouter } = require('./routers/madaHomePageRouter.js');
const { eventTypeRouter } = require('./routers/eventTypeRouter.js');
const { eventLiveRouter } = require('./routers/eventLiveRouter.js');
const { userHomePageRouter } = require('./routers/userHomePageRouter.js');
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
} else {
}
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, imagesDir);
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});
app.set('io', io);
app.use((req, res, next) => {
    req.io = io;
    next();
})
app.use('/api/user', userHomePageRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/eventType', eventTypeRouter);
app.use('/api/eventHistory', eventHistoryRouter);
app.use('/api/account', accountRouter);
app.use('/api/madaHomePage', madaHomePageRouter);
app.use('/api/eventLive', eventLiveRouter);

app.use((req, res) => {
    console.error('Path not found:', req.path);
    res.status(400).send('something is broken!');
});
server.listen(port, () => {
});