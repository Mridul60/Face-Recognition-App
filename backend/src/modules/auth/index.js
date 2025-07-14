const loginService = require('./login.service');
const CustomError = require('../../util/error');

const loginHandler = loginService({CustomError, env: process.env});

module.exports = {loginHandler};