exports.accountController = {
    async login(req, res) {
        const { username, password } = req.body;
        const { dbConnection } = require('../db_connection');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        try {
            const connection = await dbConnection.createConnection();
            
            // בדיקת התחברות משתמש
            const [rows] = await connection.execute(
                'SELECT * FROM tbl105_account WHERE username = ? AND password = ?',
                [username, password]
            );

            if (rows.length > 0) {
                const userId = rows[0].user_id;

                // קריאה לפונקציה לעדכון event_id בהתאמה למקום
                try {
                    await this.updateEventIdByPlace(userId);
                } catch (updateError) {
                    console.error('Error during event ID update:', updateError);
                }

                // שליפה מחודשת של פרטי המשתמש לאחר העדכון
                const [updatedUser] = await connection.execute(
                    'SELECT * FROM tbl105_account WHERE user_id = ?',
                    [userId]
                );

                // החזרת פרטי המשתמש לאחר העדכון
                res.json({ success: true, user: updatedUser[0] });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            connection.end();
        } catch (error) {
            console.error('Error during login:', error); // הדפס את השגיאה כאן
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    async updateEventIdByPlace(userId) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();
        
            // עדכון event_id בטבלת tbl105_account לפי התאמת place עם שימוש ב-TRIM
            const [result] = await connection.execute(`
                UPDATE tbl105_account AS a
                JOIN tbl105_MDA_live_event AS e ON TRIM(a.place) = TRIM(e.place)
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
            console.error('Error updating event_id by place:', error); // הדפס את השגיאה כאן
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
