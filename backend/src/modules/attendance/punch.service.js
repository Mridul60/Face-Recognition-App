// Import DB config
const db = require('../../config/dbConfig');

const PunchService = ({CustomError, env}) => {
    return async function punchHandler(httpRequest) {
        const {employeeID, date, punch_in_time, punch_out_time} = httpRequest.body;
        console.log(`${employeeID} - ${date} - ${punch_in_time}`);
        // Check for required fields
        if (!employeeID || !date || (!punch_in_time && !punch_out_time)) {
            return {
                statusCode: 400,
                success: false,
                message: 'Missing required fields',
            };
        }

        try {
            const rows = await db.query(
                'SELECT * FROM attendance WHERE employeeID = ? AND date = ?',
                [employeeID, date]
            );

            if (punch_in_time) {
                // Case: Punching in
                if (rows.length === 0) {
                    await db.query(
                        'INSERT INTO attendance (employeeID, date, punch_in_time) VALUES (?, ?, ?)',
                        [employeeID, date, punch_in_time]
                    );
                    console.log("Punch IN recorded");
                } else {
                    return {
                        statusCode: 400,
                        success: false,
                        message: 'Punch-in already recorded for today.',
                    };
                }

                return {
                    statusCode: 200,
                    success: true,
                    message: 'Punch-in recorded successfully.',
                };
            } else {
                // Case: Punching out
                if (rows.length === 0) {
                    // No punch-in, insert new row with punch_out_time only
                    await db.query(
                        'INSERT INTO attendance (employeeID, date, punch_out_time) VALUES (?, ?, ?)',
                        [employeeID, date, punch_out_time]
                    );
                    console.log("Punch OUT recorded without punch-in");

                    return {
                        statusCode: 200,
                        success: true,
                        message: 'Punch-out recorded, but no punch-in was found for today.',
                    };
                } else {
                    // Normal punch-out update
                    await db.query(
                        'UPDATE attendance SET punch_out_time = ? WHERE employeeID = ? AND date = ?',
                        [punch_out_time, employeeID, date]
                    );
                    console.log("Punch OUT updated");

                    return {
                        statusCode: 200,
                        success: true,
                        message: 'Punch-out recorded successfully.',
                    };
                }
            }
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
