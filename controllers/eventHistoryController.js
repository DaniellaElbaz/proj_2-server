exports.eventHistoryController = {
    async  getEventHistory(req, res) {
        const { dbConnection } = require('../db_connection');
        const eventId = req.query.eventId;
        const userId = req.query.userId;
    
        if (!eventId || !userId) {
            return res.status(400).json({ success: false, message: 'Missing eventId or userId' });
        }
    
        let connection;
        try {
            connection = await dbConnection.createConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM tbl105_events_history WHERE event_id = ? AND user_id = ?',
                [eventId, userId]
            );
    
            if (rows.length > 0) {
                res.json({ success: true, data: rows });
            } else {
                res.json({ success: false, message: 'Event not found or user not connected to event' });
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
            res.status(500).send({ success: false, message: 'Error fetching event details' });
        } finally {
            if (connection) {
                connection.end();
            }
        }
    }
    ,
async getEventByTypeEndDate(req, res) {
    const { dbConnection } = require('../db_connection');
    let { eventType, date_and_time } = req.query;

    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const formattedMonth = `${startOfYear.getFullYear()}-01`;

    eventType = eventType === undefined || eventType === '' ? null : eventType;
    date_and_time = date_and_time === undefined || date_and_time === '' ? formattedMonth : date_and_time;

    try {
        const connection = await dbConnection.createConnection();
        const [rows] = await connection.execute(
            `SELECT type_event, DATE_FORMAT(date_and_time, '%Y-%m') AS month, COUNT(*) AS event_count
            FROM tbl105_events_history
            WHERE (? IS NULL OR type_event = ?)
                AND (? = '' OR DATE_FORMAT(date_and_time, '%Y-%m') >= ?)
            GROUP BY type_event, month
            ORDER BY month;`,
            [eventType, eventType, date_and_time, date_and_time]
        );
        connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).send({ success: false, message: 'Error fetching event stats' });
    }
}

};