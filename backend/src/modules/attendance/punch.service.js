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
            // Check if record exists for this employee on this date
            const existing = await db.query(
                'SELECT * FROM attendance WHERE employeeID = ? AND date = ?',
                [employeeID, date]
            );
            console.log("existing: ", existing);

            // Insert punch-in if no record exists
            if (existing.length === 0 && punch_in_time) {
                await db.query(
                    'INSERT INTO attendance (employeeID, date, punch_in_time) VALUES (?, ?, ?)',
                    [employeeID, date, punch_in_time]
                );
            }
            // Update punch-out if record exists
            else if (existing.length > 0 && punch_out_time) {
                await db.query(
                    'UPDATE attendance SET punch_out_time = ? WHERE employeeID = ? AND date = ?',
                    [punch_out_time, employeeID, date]
                );
            }
            // Invalid or duplicate punch
            else {
                return {
                    statusCode: 400,
                    success: false,
                    message: 'Invalid punch flow or duplicate entry',
                };
            }

            // Success response
            return {
                statusCode: 200,
                success: true,
                message: 'Attendance saved',
            };
        } catch (err) {
            // DB error response
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
