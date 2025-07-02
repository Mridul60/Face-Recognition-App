const PunchService = require('./punch.service');
const CustomError = require('../../util/error');

const punchHandler = PunchService({CustomError, env: process.env});

module.exports = {punchHandler};
