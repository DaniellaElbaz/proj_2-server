exports.eventHistoryController = {
async getEventHistory(req, res) {
    const { dbConnection } = require('../db_connection');
    try {
        const connection = await dbConnection.createConnection();
        const [eventHistory] = await connection.execute('SELECT * FROM tbl105_events_history;');
        connection.end();
        res.json({ success: true, eventHistory });
    } catch (error) {
        console.error('Error fetching event History:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
},
async  getEventByTypeEndDate(req, res) {
    const { dbConnection } = require('../db_connection');
    const { eventType, month } = req.query;

    try {
        const connection = await dbConnection.createConnection();
        const [rows] = await connection.execute(
            `SELECT type_event, DATE_FORMAT(date_and_time, '%Y-%m') AS month, COUNT(*) AS event_count
            FROM tbl105_events_history
            WHERE (? IS NULL OR type_event = ?)
                AND (? IS NULL OR DATE_FORMAT(date_and_time, '%Y-%m') = ?)
            GROUP BY type_event, month
            ORDER BY month;`,
            [eventType, eventType, month, month]
        );
        connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).send({ success: false, message: 'Error fetching event stats' });
    }
}
};