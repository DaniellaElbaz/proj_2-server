exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        const eventId = req.params.eventId;
        try {
            const connection = await dbConnection.createConnection();
            const [recentReports] = await connection.execute(
                'SELECT * FROM tbl105_update_MDA_event WHERE event_id = ? ORDER BY time DESC LIMIT 3',
                [eventId]
            );
            await connection.end();
            res.json({ success: true, recentReports });
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};
