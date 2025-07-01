const LoginService = require('./login.service');
const CustomError = require('../../util/error');

const loginHandler = LoginService({ CustomError, env: process.env });
module.exports = {loginHandler};