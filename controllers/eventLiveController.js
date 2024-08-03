exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        const eventId = req.params.eventId;
        try {
            const connection = await dbConnection.createConnection();
            
            // Fetch the latest event
            const [latestEvent] = await connection.execute(
                'SELECT * FROM tbl105_MDA_live_event ORDER BY event_id DESC LIMIT 1'
            );
            
            if (latestEvent.length === 0) {
                return res.status(404).json({ success: false, message: 'No events found' });
            }
    
            const latestEventId = latestEvent[0].event_id;
            
            // Fetch updates related to the latest event
            const [recentReports] = await connection.execute(
                'SELECT * FROM tbl105_update_MDA_event WHERE event_id = ? ORDER BY time DESC LIMIT 3',
                [latestEventId]
            );
    
            await connection.end();
            
            res.json({ success: true, latestEvent: latestEvent[0], recentReports });
        } catch (error) {
            console.error('Error fetching latest event updates:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async insertToUser(req, res){
        const { dbConnection } = require('../db_connection');
        const { user_id, event_id, place } = req.body;

        if (!user_id || !event_id || !place) {
            console.log('Missing required fields:', { user_id, event_id, place });
            return res.status(400).json({ success: false, message: 'User ID, Event ID, and place are required' });
        }
    
        try {
            const connection = await dbConnection.createConnection();
            const values = [event_id, user_id, null, place]; // report_id is set to null
            const [result] = await connection.execute(
                'INSERT INTO tbl105_users_event (event_id, user_id, report_id, place) VALUES (?, ?, ?, ?)',
                values
            );
            await connection.end();
    
            console.log('Data inserted successfully:', result);
            res.json({ success: true, result });
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
},
async updateUserPlace(req, res) {
    const { dbConnection } = require('../db_connection');
    const { user_id, place } = req.body;

    if (typeof user_id !== 'number' || user_id <= 0 || place !== null) {
        return res.status(400).json({ success: false, message: 'Invalid user ID or place' });
    }
    try {
        const connection = await dbConnection.createConnection();
        await connection.execute(
            'UPDATE tbl105_account SET place = ? WHERE user_id = ?',
            [place, user_id]
        );
        await connection.end();
        res.json({ success: true, message: 'User place updated successfully' });
    } catch (error) {
        console.error('Error updating user place:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
};
