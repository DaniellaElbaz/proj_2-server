exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        const userId = req.params.userId; // קבלת userId מהפרמטרים של הבקשה

        try {
            const connection = await dbConnection.createConnection();

            // שאילתא להבאת event_id של המשתמש
            const [userEvent] = await connection.execute(`
                SELECT event_id 
                FROM tbl105_account 
                WHERE user_id = ?
            `, [userId]);

            // בדיקה אם נמצא event_id
            if (userEvent.length === 0) {
                return res.status(404).json({ success: false, message: 'Event ID not found for user' });
            }

            const eventId = userEvent[0].event_id;

            // השאילתא להבאת הדיווחים העדכניים ביותר עבור event_id המתאים
            const [recentReports] = await connection.execute(`
                SELECT u.update_description, u.time
                FROM tbl105_update_MDA_event u
                WHERE u.event_id = ?
                ORDER BY u.time DESC
                LIMIT 3;
            `, [eventId]);

            // השאילתא להבאת הדיווח האחרון מהיסטוריית האירועים (נשארת כפי שהיא)
            const [eventLiveReports] = await connection.execute(`
                SELECT event_name, event_status, type_event 
                FROM tbl105_events_history 
                ORDER BY date_and_time DESC 
                LIMIT 1;
            `);

            connection.end();

            res.json({ success: true, eventLiveReports, recentReports });
        } catch (error) {
            console.error('Error fetching event Notification:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};
