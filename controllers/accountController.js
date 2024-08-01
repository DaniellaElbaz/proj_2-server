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

            if (rows.length > 0) {
                const userId = rows[0].user_id;

                // קריאה לפונקציה לעדכון event_id בהתאמה למקום
                await this.updateEventIdByPlace(userId);

                // שליפה מחודשת של פרטי המשתמש לאחר העדכון
                const [updatedUser] = await connection.execute(
                    'SELECT * FROM tbl105_account WHERE user_id = ?',
                    [userId]
                );

                connection.end();

                // החזרת פרטי המשתמש לאחר העדכון
                res.json({ success: true, user: updatedUser[0] });
            } else {
                connection.end();
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    async updateEventIdByPlace(userId) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();

            // עדכון event_id בטבלת tbl105_account לפי התאמת place
            const [result] = await connection.execute(`
                UPDATE tbl105_account AS a
                JOIN tbl105_MDA_live_event AS e ON a.place = e.place
                SET a.event_id = e.event_id
                WHERE a.user_id = ?
            `, [userId]);

            connection.end();

            if (result.affectedRows > 0) {
                console.log(`Event ID updated for user ${userId} based on matching place.`);
            } else {
                console.log(`No matching place found for user ${userId}, no update made.`);
            }
        } catch (error) {
            console.error('Error updating event_id by place:', error);
            throw error;
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
                'INSERT INTO tbl105_update_MDA_event (event_id, update_description, time) VALUES (?, ?, ?)',
                [eventId, updateDescription, timeString]
            );

            connection.end();
        } catch (error) {
            console.error('Error inserting update record:', error);
            throw error;
        }
    }
};
