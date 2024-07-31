exports.userHomePageController = {
    async insertReport(req, res){
        const { dbConnection } = require('../db_connection');
        const { eventWhen, eventExplain, userId, eventId, userRegretsId } = req.body;
        if (!eventWhen || !eventExplain || !userId || !eventId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        try {
            const connection = await dbConnection.createConnection();
            const [reportResult] = await connection.execute(
                `INSERT INTO tbl105_report (user_id, event_id, event_details, user_view_details, user_regrets_id)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                event_details = VALUES(event_details),
                user_view_details = VALUES(user_view_details),
                user_regrets_id = VALUES(user_regrets_id)`,
                [userId, eventId, eventWhen, eventExplain, userRegretsId]
            );
            const reportId = reportResult.insertId || (await connection.execute(
                `SELECT report_id FROM tbl105_report WHERE user_id = ? AND event_id = ?`,
                [userId, eventId]
            ))[0][0].report_id;
            await connection.execute(
                `UPDATE tbl105_users_event
                SET report_id = ?
                WHERE user_id = ? AND event_id = ?`,
                [reportId, userId, eventId]
            );
            connection.end();
            res.json({ success: true });
        } catch (error) {
            console.error('Error updating report:', error);
            res.status(500).json({ success: false, message: 'Error updating report' });
        }
    },
    async getUsersInEvent(req, res){
        const { dbConnection } = require('../db_connection');
        const { eventId } = req.query;

    if (!eventId) {
        return res.status(400).json({ success: false, message: 'Missing event ID' });
    }

    try {
        const connection = await dbConnection.createConnection();
        const [rows] = await connection.execute(
            `SELECT 
                u.event_id, 
                u.user_id, 
                u.report_id, 
                u.place AS user_event_place, 
                a.first_name, 
                a.last_name, 
                a.certification_type, 
                a.user_photo, 
                a.username, 
                a.password,
                a.place AS account_place
            FROM tbl105_users_event u
            JOIN tbl105_account a ON u.user_id = a.user_id
            WHERE u.event_id = ?`,
            [eventId]
        );
        connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching event users:', error);
        res.status(500).json({ success: false, message: 'Error fetching event users' });
    }
    }
}