exports.madaHomePageController = {
    async getNotification(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const [eventNotification] = await connection.execute('SELECT * FROM tbl105_notfication;');
            connection.end();
            res.json({ success: true, eventNotification });
        } catch (error) {
            console.error('Error fetching event Notification:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
    };