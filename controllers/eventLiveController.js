exports.madaHomePageController = {
    async getNotification(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const [eventLiveReports] = await connection.execute('SELECT * FROM tbl105_tbl105_events_history;');
            connection.end();
            res.json({ success: true, eventLiveReports });
        } catch (error) {
            console.error('Error fetching event Notification:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
    };