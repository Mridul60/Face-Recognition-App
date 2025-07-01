const CustomError = require('../util/error');
const { verifyToken } = require('../util/token');
const { sendResponse } = require('../util/http-request');

const authGuard = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const key = process.env.AUTH_KEY;
        console.log(key);
        const decoded = verifyToken(token, key);
        req.user = decoded;
        next();
    } catch(err) {
        const error = CustomError({ message: 'Uanauthroized access.', status: 401});
        sendResponse(res, error.handle())
    }
}

module.exports = {
    authGuard
}
