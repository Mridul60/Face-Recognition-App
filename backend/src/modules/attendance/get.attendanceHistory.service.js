const db = require("../../config/dbConfig");

const getAttendanceHistoryService = ({ CustomError, env }) => {
    return async function getAttendanceHistoryHandler(httpRequest) {
        try {
            const { employeeID, month, year } = httpRequest.queryParams;

            console.log("Received request:", { employeeID, month, year });

            // Validate required params
            if (!employeeID || month === undefined || year === undefined) {
                throw new CustomError({
                    statusCode: 400,
                    message: 'Employee ID, month, and year are required'
                });
            }

            const monthInt = parseInt(month);
            const yearInt = parseInt(year);

            if (
                isNaN(monthInt) || isNaN(yearInt) ||
                monthInt < 0 || monthInt > 11 ||
                yearInt < 2000 || yearInt > 2100
            ) {
                throw new CustomError({
                    statusCode: 400,
                    message: 'Invalid month or year'
                });
            }

            // Compute start and end of the month in UTC
            const startDate = new Date(Date.UTC(yearInt, monthInt, 1));
            const endDate = new Date(Date.UTC(yearInt, monthInt + 1, 0, 23, 59, 59));

            console.log("Fetching data between:", startDate.toISOString(), "and", endDate.toISOString());

            const query = `
                SELECT
                    employeeID,
                    DATE(CONVERT_TZ(date, '+00:00', '+05:30')) AS date,
                    punch_in_time,
                    punch_out_time
                FROM attendance
                WHERE employeeID = ?
                AND CONVERT_TZ(date, '+00:00', '+05:30') BETWEEN ? AND ?
                ORDER BY date DESC
            `;

            const result = await db.query(query, [employeeID, startDate.toISOString(), endDate.toISOString()]);

            return {
                statusCode: 200,
                data: result || []
            };

        } catch (error) {
            console.error('Error in getAttendanceHistoryHandler:', error);

            if (error.statusCode) {
                throw error;
            }

            throw new CustomError({
                statusCode: 500,
                message: 'Internal server error while fetching attendance history'
            });
        }
    };
};

module.exports = getAttendanceHistoryService;
