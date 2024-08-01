exports.accountController = {
    async login(req, res) {
        const { username, password } = req.body;
        const { dbConnection } = require('../db_connection');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        try {
            const connection = await dbConnection.createConnection();

            // שליפת פרטי המשתמש מהטבלה tbl105_account
            const [rows] = await connection.execute(
                'SELECT * FROM tbl105_account WHERE username = ? AND password = ?',
                [username, password]
            );

            if (rows.length > 0) {
                const userId = rows[0].user_id;

                // עדכון event_id בחשבון על פי התאמת place
                const [updateResult] = await connection.execute(`
                    UPDATE tbl105_account AS a
                    JOIN tbl105_MDA_live_event AS e ON TRIM(a.place) = TRIM(e.place)
                    SET a.event_id = e.event_id
                    WHERE a.user_id = ?
                `, [userId]);

                console.log(`Updated ${updateResult.affectedRows} rows with matching place.`);

                // הכנסת נתונים לטבלה tbl105_users_event
                const [insertResult] = await connection.execute(`
                    INSERT INTO tbl105_users_event (user_id, event_id, place)
                    SELECT a.user_id, e.event_id, TRIM(a.place)
                    FROM tbl105_account AS a
                    JOIN tbl105_MDA_live_event AS e ON TRIM(a.place) = TRIM(e.place)
                    WHERE a.user_id = ?;
                `, [userId]);

                console.log(`Inserted ${insertResult.affectedRows} rows into tbl105_users_event.`);

                // החזרת תגובה לאחר עדכון מוצלח
                res.json({ success: true, user: rows[0] });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            connection.end();
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
    },
};
