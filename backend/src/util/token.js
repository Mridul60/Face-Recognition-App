const jwt = require('jsonwebtoken');

const generateToken = (data, expiresIn, key) => {
    try {
        const token = jwt.sign(data, key, { expiresIn });
        return token;
    } catch(err) {
        throw(err);
    }
}

const verifyToken = (token, key) => {
    try {
        const decoded = jwt.verify(token, key);
        return decoded;
    } catch(err) {
        throw(err);
    }
}

module.exports = {
    generateToken,
    verifyToken
}