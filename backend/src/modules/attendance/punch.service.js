// Import DB config
const db = require('../../config/dbConfig');

const PunchService = ({ CustomError, env }) => {
    return async function punchHandler(httpRequest) {
        const { employeeID, date, punch_in_time, punch_out_time } = httpRequest.body;

        // Check for required fields
        if (!employeeID || !date || (!punch_in_time && !punch_out_time)) {
            return {
                statusCode: 400,
                success: false,
                message: 'Missing required fields',
            };
        }

        try {
            if (punch_in_time) {
                await db.query(
                    'INSERT INTO attendance (employeeID, date, punch_in_time) VALUES (?, ?, ?)',
                    [employeeID, date, punch_in_time],
                );
            } else {
                await db.query(
                    'UPDATE attendance SET punch_out_time = ? WHERE employeeID = ? AND date = ?',
                    [punch_out_time, employeeID, date]
                );
            }
            return {
                statusCode: 200,
                success: true,
                message: 'Attendance saved',
            };
        } catch (err) {
            console.error('Punch DB error:', err);
            return {
                statusCode: 500,
                success: false,
                message: 'Internal server error',
            };
        }
    };
};

module.exports = PunchService; // Export the service
