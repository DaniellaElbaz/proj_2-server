require('dotenv').config();
const express = require('express');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 8081;
const { eventHistoryRouter } = require('./routers/eventHistoryRouter.js');
const { accountRouter } = require('./routers/accountRouter.js');
const { madaHomePageRouter } = require('./routers/madaHomePageRouter.js');
const { eventTypeRouter } = require('./routers/eventTypeRouter.js');
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': "GET, POST, PUT, DELETE",
        'Content-Type': 'application/json'
    });
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));
app.use('/api/eventType', eventTypeRouter);
app.use('/api/eventHistory', eventHistoryRouter);
app.use('/api/account', accountRouter);
app.use('/api/madaHomePage', madaHomePageRouter);
app.use((req, res) => {
    console.error('Path not found:', req.path);
    res.status(400).send('something is broken!');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
