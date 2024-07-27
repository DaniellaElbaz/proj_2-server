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
    }
};
