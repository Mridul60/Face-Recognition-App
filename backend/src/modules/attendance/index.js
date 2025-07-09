const PunchService = require('./punch.service');
const CustomError = require('../../util/error');
const GetAttendanceService = require("./get.attendance.service");

const punchHandler = PunchService({CustomError, env: process.env});
const getAttendanceHandler = GetAttendanceService({CustomError, env: process.env});

module.exports = {punchHandler, getAttendanceHandler};
