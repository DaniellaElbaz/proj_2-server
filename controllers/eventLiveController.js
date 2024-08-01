exports.eventLiveController = {
    async getLiveReports(req, res) {
        const { dbConnection } = require('../db_connection');
        try {
            const connection = await dbConnection.createConnection();

            // השאילתא הראשונה להבאת הדיווח האחרון
            const [eventLiveReports] = await connection.execute(`
                SELECT event_name, event_status, type_event 
                FROM tbl105_events_history 
                ORDER BY date_and_time DESC 
                LIMIT 1;
            `);

            // השאילתא השנייה להבאת 3 האירועים העדכניים ביותר לפי שעות
            const [recentReports] = await connection.execute(`
                SELECT report_description, DATE_FORMAT(report_time, '%H:%i') AS report_time
                FROM tbl105_MDA_reports
                ORDER BY report_time DESC
                LIMIT 3;
            `);

            connection.end();

            res.json({ success: true, eventLiveReports, recentReports });
        } catch (error) {
            console.error('Error fetching event Notification:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};
