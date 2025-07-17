import bcrypt from 'bcrypt'
const dotenv = require('dotenv').config({});
const Employee = require('../../models/Employee'); 


const loginService = ({ CustomError, env }) => {
    return async function loginHandler(httpRequest) {
        const { email, password } = httpRequest.body;

        // Validate input
        if (!email || !password) {
            return CustomError({message: 'Email and password are required.', statusCode: 400}).handle();
        }

        try {
            const results = await Employee.findByEmail(email);

            if (!results || results.length === 0) {
                return CustomError({message: 'Invalid email or password', statusCode: 404}).handle();
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(password,user.password);
            if (!isMatch) {
                return CustomError({message: 'Invalid email or password', statusCode: 401}).handle();
            }

            // Successful login
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
            return CustomError({message: 'Server error. Please try again later.', statusCode: 500}).handle();
        }
    };
};

module.exports = loginService;