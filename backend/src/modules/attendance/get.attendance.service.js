// Import DB config
const db = require('../../config/dbConfig');

const GetAttendanceService = ({ CustomError, env }) => {
    return async function getAttendanceHandler(httpRequest) {
        try {
            console.log('Received HTTP request with queryParams:', httpRequest.queryParams);

            const { employeeID, date } = httpRequest.queryParams;

            // Validate required parameters
            if (!employeeID || !date) {
                console.log('Missing employeeID or date');
                throw new CustomError({
                    statusCode: 400,
                    message: 'Employee ID and date are required'
                });
            }

            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                console.log('Invalid date format:', date);
                throw new CustomError({
                    statusCode: 400,
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            console.log(`Fetching attendance for employeeID: ${employeeID} on date: ${date}`);

            // Query that converts stored UTC time to IST before comparing
            const query = `
                SELECT
                    employeeID,
                    date,
                    punch_in_time,
                    punch_out_time
                FROM attendance
                WHERE employeeID = ? AND DATE(CONVERT_TZ(date, '+00:00', '+05:30')) = ?
            `;
            const result = await db.query(query, [employeeID, date]);

            console.log('Query result:', result);

            // If no attendance record found for the date
            if (!result || result.length === 0) {
                console.log('No attendance record found for the given date.');
                return {
                    statusCode: 200,
                    data: {
                        employeeID,
                        date,
                        punch_in_time: null,
                        punch_out_time: null,
                        message: 'No attendance record found for this date'
                    }
                };
            }

            // Return the attendance data
            const attendanceData = result[0];
            console.log('Attendance record found:', attendanceData);

            return {
                statusCode: 200,
                data: {
                    employeeID: attendanceData.employeeID,
                    date: attendanceData.date,
                    punch_in_time: attendanceData.punch_in_time,
                    punch_out_time: attendanceData.punch_out_time
                }
            };

        } catch (error) {
            console.error('Error in getAttendanceHandler:', error);

            if (error.statusCode) {
                throw error;
            }

            throw new CustomError({
                statusCode: 500,
                message: 'Internal server error while fetching attendance'
            });
        }
    };
};

module.exports = GetAttendanceService;
