exports.accountController = {
    async login(req, res) {
        const { username, password } = req.body;
        const { dbConnection } = require('../db_connection');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        try {
            const connection = await dbConnection.createConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM tbl105_account WHERE username = ? AND password = ?',
                [username, password]
            );
            connection.end();

            if (rows.length > 0) {
                res.json({ success: true, user: rows[0] });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
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
            await connection.execute(
                'INSERT INTO tbl105_update_MDA_event (event_id, update_description) VALUES (?, ?)',
                [eventId, updateDescription]
            );
            connection.end();
        } catch (error) {
            console.error('Error inserting update record:', error);
            throw error;
        }
    }
};
