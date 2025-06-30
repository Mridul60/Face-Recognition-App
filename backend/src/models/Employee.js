const db = require('../config/dbConfig');

const Employee = {
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM employee WHERE email = ?';
            db.query(query, [email], (err, results) => {
                if (err) return reject(err);
                return resolve(results);
            });
        });
    },
};

module.exports = Employee;
