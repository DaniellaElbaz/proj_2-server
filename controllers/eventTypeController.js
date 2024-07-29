exports.eventTypeController = {
    async getEventTypeName(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const [type] = await connection.execute('SELECT name FROM tbl105_MDA_event_type;');
            connection.end();
            res.json({ success: true, type });
        } catch (error) {
            console.error('Error fetching event type:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async getEventMDAEvents(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const [events] = await connection.execute('SELECT * FROM tbl105_MDA_live_event;');
            connection.end();
            res.json({ success: true, events });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async addEvents(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            const { eventName, eventPlace, eventDate, eventTime, eventStatus, eventType, maxHelper } = req.body;
            const photos = req.files.map(file => file.filename).join(',');
            const values = [eventName, eventPlace, eventDate, eventTime, eventStatus, photos, eventType, maxHelper];
            
            const [queryResult] = await connection.execute(
                'INSERT INTO tbl105_MDA_live_event (event_name, place, date, time, status, map, event_type, max_helper) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                values
            );
            connection.end();
            res.json({ success: true, queryResult });
        } catch (error) {
            console.error('Error adding event:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
}