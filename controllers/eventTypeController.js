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
        const { accountController } = require('./accountController');
        const { updateUserPlace } = accountController;
        try {
            const connection = await dbConnection.createConnection();
            const { eventName, eventPlace, eventDate, eventTime, eventStatus, eventType, maxHelper } = req.body;
            const photos = req.files.map(file => file.filename).join(',');
            const values = [eventName, eventPlace, eventDate, eventTime, eventStatus, photos, eventType, maxHelper];
            const [queryResult] = await connection.execute(
                'INSERT INTO tbl105_MDA_live_event (event_name, place, date, time, status, map, event_type, max_helper) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                values
            );
            const historyValues = [queryResult.insertId, eventName, eventPlace, eventDate, eventStatus, photos, eventType, photos];
            await connection.execute(
                'INSERT INTO tbl105_events_history (event_id, event_name, address, date_and_time, event_status, event_photo, type_event, map) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                historyValues
            );
            await updateUserPlace(eventPlace);
            connection.end();
            const io = req.app.get('io');
            io.emit('eventAdded', { eventName, eventPlace, eventDate, eventTime, eventStatus, photos, eventType, maxHelper });
            res.json({ success: true, queryResult });
        } catch (error) {
            console.error('Error adding event:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async deleteEvent(req, res) {
        const { dbConnection } = require('../db_connection');
        const { eventTypeController } = require('./eventTypeController');
        const { updateUserPlaceForEvent } = eventTypeController;
        const eventId = req.params.id;
        try {
            const connection = await dbConnection.createConnection();
            const [event] = await connection.execute('SELECT place FROM tbl105_MDA_live_event WHERE event_id = ?', [eventId]);
            if (event.length === 0) {
                connection.end();
                return res.status(404).json({ success: false, message: 'Event not found' });
            }
            const eventPlace = event[0].place;
            const [lastEvent] = await connection.execute('SELECT event_id FROM tbl105_MDA_live_event ORDER BY event_id DESC LIMIT 1');
            const isLastEvent = (lastEvent.length > 0 && lastEvent[0].event_id === parseInt(eventId, 10));
            const [result] = await connection.execute('DELETE FROM tbl105_MDA_live_event WHERE event_id = ?', [eventId]);
            if (result.affectedRows > 0) {
                connection.end();
                if (isLastEvent) {
                    await updateUserPlaceForEvent(eventPlace);
                }
                const io = req.app.get('io');
                io.emit('eventDeleted', { eventId });
                res.json({ success: true });
            } else {
                connection.end();
                res.status(404).json({ success: false, message: 'Event not found' });
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async  updateUserPlaceForEvent(eventPlace) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            await connection.execute(
                'UPDATE tbl105_account SET place = NULL WHERE place = ? AND certification_type = "Medical"',
                [eventPlace]
            );
            await connection.end();
        } catch (error) {
            console.error('Error updating user place:', error);
            throw error;
        }
    },
    async updateStatus(req, res) {
        const { dbConnection } = require('../db_connection');
        const { accountController } = require('./accountController');
        const { insertUpdateRecord } =accountController;
        const eventId = req.params.id;
        const eventStatus = req.body.status;
        const io = req.io;
        try {
            const connection = await dbConnection.createConnection();
            await connection.execute(
                'UPDATE tbl105_MDA_live_event SET status = ? WHERE event_id = ?',
                [eventStatus, eventId]
            );
            await insertUpdateRecord(eventId, eventStatus);
            io.emit('statusUpdate', { eventId, eventStatus});
            connection.end();
            res.status(200).send({ message: 'Event status updated successfully' });
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).send({ error: 'Error updating event status' });
        }
    }
}