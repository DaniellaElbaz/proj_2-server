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
}
};