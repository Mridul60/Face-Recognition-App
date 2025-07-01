const FacialService = require('./facial.service');
const CustomError = require('../../util/error');

const facialHandler = FacialService({CustomError, env: process.env});
module.exports = {facialHandler};