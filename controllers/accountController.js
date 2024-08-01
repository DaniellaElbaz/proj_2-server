exports.accountController = {
    async login(req, res) {
        const { dbConnection } = require('../db_connection');
        const { username, password } = req.body;
    try {
        const connection = await dbConnection.createConnection();
        const [userResults] = await connection.execute(
            'SELECT * FROM tbl105_account WHERE username = ? AND password = ?',
            [username, password]
        );

        if (userResults.length === 0) {
            await connection.end();
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const user = userResults[0];
        const [eventResults] = await connection.execute(
            'SELECT * FROM tbl105_MDA_live_event WHERE place = ?',
            [user.place]
        );
        await connection.end();

        if (eventResults.length > 0) {
            return res.json({ success: true, user, hasEvent: true, event: eventResults[0] });
        } else {
            return res.json({ success: true, user, hasEvent: false });
        }
    } catch (error) {
        console.error('Error querying database:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
},
    async updateUserPlace(eventPlace) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
            await connection.execute(
                'UPDATE tbl105_account SET place = ? WHERE certification_type = "Medical"',
                [eventPlace]
            );
            connection.end();
        } catch (error) {
            console.error('Error updating user place:', error);
            throw error;
        }
    },
    async insertUpdateRecord(eventId, updateDescription) {
        const { dbConnection } = require('../db_connection');
    try {
        const connection = await dbConnection.createConnection();
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];

        await connection.execute(
            'INSERT INTO tbl105_update_MDA_event (event_id, update_description,time) VALUES (?, ?, ?)',
            [eventId, updateDescription, timeString]
        );

        connection.end();
    } catch (error) {
        console.error('Error inserting update record:', error);
        throw error;
    }
}
};
