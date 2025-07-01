const db = require('../config/dbConfig');

const OfficeLocation = {
    getAll: (callback) => {
        db.query('SELECT * FROM officelocation', callback);
    },

    create: (name, latitude, longitude, radius, callback) => {
        const query = 'INSERT INTO officelocation (name, latitude, longitude, radius) VALUES (?, ?, ?, ?)';
        db.query(query, [name, latitude, longitude, radius], callback);
    }
};

module.exports = OfficeLocation;
