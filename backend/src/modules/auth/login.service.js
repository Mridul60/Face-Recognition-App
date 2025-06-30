// const { generateToken } = require('../../util/token');
// const { checkPassword } = require('../../util/password');
// const path = require('path');
const dotenv = require('dotenv').config({});
const Employee = require('../../models/Employee'); // path based on your structure

const loginService = ({ CustomError, env }) => {
    return async function loginHandler(httpRequest) {
        const { email, password } = httpRequest.body;

        if (!email || !password) {
            return {
                status: false,
                statusCode: 400,
                message: 'Email and password are required.'
            };
        }

        try {
            const results = await Employee.findByEmail(email);

            if (!results || results.length === 0) {
                return {
                    status: false,
                    statusCode: 404,
                    message: 'User not found.'
                };
            }

            const user = results[0];

            if (user.password !== password) {
                return {
                    status: false,
                    statusCode: 401,
                    message: 'Incorrect password.'
                };
            }

            return {
                status: true,
                statusCode: 200,
                message: 'Successfully logged in!',
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            };
        } catch (err) {
            console.error('Login error:', err);
            return {
                status: false,
                statusCode: 500,
                message: 'Server error. Please try again later.'
            };
        }
    };
};

module.exports = loginService;
