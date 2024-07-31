exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const [eventLiveReports] = await connection.execute(`
                SELECT event_name, event_status, type_event 
                FROM tbl105_events_history 
                ORDER BY date_and_time DESC 
                LIMIT 1;
            `);
            connection.end();
            res.json({ success: true, eventLiveReports });
        } catch (error) {
            console.error('Error fetching event Notification:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
    };