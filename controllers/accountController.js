exports.accountController = {
    async login(req, res) {
        const { username, password } = req.body;
        const { dbConnection } = require('../db_connection');
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }
        let connection;
        try {
            connection = await dbConnection.createConnection();
            
            // בדיקת התחברות משתמש
            const [rows] = await connection.execute(
                'SELECT * FROM tbl105_account WHERE username = ? AND password = ?',
                [username, password]
            );

            if (rows.length > 0) {
                const userId = rows[0].user_id;

                // קריאה לפונקציה להכנסת נתונים לטבלה tbl105_users_event
                try {
                    await exports.accountController.insertUserEvent(userId);
                } catch (insertError) {
                    console.error('Error during user event insertion:', insertError);
                }

                // שליפה מחודשת של פרטי המשתמש לאחר העדכון
                const [updatedUser] = await connection.execute(
                    'SELECT * FROM tbl105_account WHERE user_id = ?',
                    [userId]
                );

                // החזרת פרטי המשתמש לאחר העדכון
                console.log(`User after update: ${JSON.stringify(updatedUser[0])}`);
                res.json({ success: true, user: updatedUser[0] });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } finally {
            if (connection) {
                connection.end(); // ודא שהחיבור נסגר כראוי
            }
        }
    },

    insertUserEvent: async function(userId) {
        const { dbConnection } = require('../db_connection');
        let connection;
        try {
            connection = await dbConnection.createConnection();

            // הכנס את הנתונים לטבלה tbl105_users_event כאשר place זהה בשתי הטבלאות
            const [result] = await connection.execute(`
                INSERT INTO tbl105_users_event (user_id, event_id, place)
                SELECT a.user_id, e.event_id, a.place
                FROM tbl105_account AS a
                JOIN tbl105_MDA_live_event AS e ON TRIM(a.place) = TRIM(e.place)
                WHERE a.user_id = ?;
            `, [userId]);

            if (result.affectedRows > 0) {
                console.log(`User event record inserted for user ${userId}.`);
            } else {
                console.log(`No matching place found for user ${userId}, no insertion made.`);
            }
        } catch (error) {
            console.error('Error inserting user event record:', error); // הדפס את השגיאה כאן
            throw error;
        } finally {
            if (connection) {
                connection.end(); // ודא שהחיבור נסגר כראוי
            }
        }
    },

    // פונקציות נוספות...
};
