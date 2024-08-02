exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        const eventId = req.params.eventId;
        try {
            const connection = await dbConnection.createConnection();
            const [recentReports] = await connection.execute(
                'SELECT * FROM tbl105_update_MDA_event ORDER BY time DESC LIMIT 3',
                [eventId]
            );
            await connection.end();
            res.json({ success: true, recentReports });
        } catch (error) {
            console.error('Error fetching event notifications:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async insertToUser(req, res){
        const { dbConnection } = require('../db_connection');
        const { user_id, event_id, place } = req.body;
    
    if (!user_id || !event_id || !place) {
        return res.status(400).json({ success: false, message: 'User ID, Event ID, and place are required' });
    }

    try {
        const connection = await dbConnection.createConnection();
        const values = [event_id, user_id, null, place]; // report_id is set to null
        const [result] = await connection.execute(
            'INSERT INTO tbl105_users_event (event_id, user_id, report_id, place) VALUES (?, ?, ?, ?)',
            values
        );
        connection.end();

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    }
};
