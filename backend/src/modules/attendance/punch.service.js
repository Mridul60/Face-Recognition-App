// Import DB config
const db = require('../../config/dbConfig');

const PunchService = ({CustomError, env}) => {
    return async function punchHandler(httpRequest) {
        const {employeeID, date, punch_in_time, punch_out_time} = httpRequest.body;

        if (!employeeID || !date || (!punch_in_time && !punch_out_time)) {
            return CustomError({message: 'Missing required fields. Please try again.', statusCode: 400}).handle();
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
                } else {
                    return CustomError({message: 'Punch-in already recorded for today.', statusCode: 400}).handle();
                }
                return {message: 'Punch-in recorded successfully.', statusCode: 200};
            } else {
                // Case: Punching out
                if (rows.length === 0) {
                    // No punch-in, insert new row with punch_out_time only
                    await db.query(
                        'INSERT INTO attendance (employeeID, date, punch_out_time) VALUES (?, ?, ?)',
                        [employeeID, date, punch_out_time]
                    );
                    return  {message: "Punch OUT recorded without punch-in", statusCode: 200};
                } else {
                    // Normal punch-out update
                    await db.query(
                        'UPDATE attendance SET punch_out_time = ? WHERE employeeID = ? AND date = ?',
                        [punch_out_time, employeeID, date]
                    );

                    return {statusCode: 200, message: 'Punch-out recorded successfully.'};
                }
            }
        } catch (err) {
            console.error('Punch DB error:', err);
            return CustomError({message: 'Server error. Please try again.', statusCode: 500}).handle();
        }

    };
};

module.exports = PunchService; // Export the service
