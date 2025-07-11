const PunchService = require('./punch.service');
const CustomError = require('../../util/error');
const GetAttendanceService = require("./get.attendance.service");
const GetAttendanceHistory = require("./get.attendanceHistory.service");

const punchHandler = PunchService({CustomError, env: process.env});
const getAttendanceHandler = GetAttendanceService({CustomError, env: process.env});
const getAttendanceHistoryHandler = GetAttendanceHistory({CustomError, env: process.env});

module.exports = {punchHandler, getAttendanceHandler, getAttendanceHistoryHandler};
