const db = require('../config/dbConfig');
const FacialData = {
    getByEmployeeId: (employeeID, callback) => {
        const query = 'SELECT * FROM facialdata WHERE employeeID = ?';
        db.query(query, [employeeID], callback);
    },

    create: (employeeID, facialDescriptor, callback) => {
        const query = `INSERT INTO facialdata (employeeID, facialDescriptor, createdDate, createdTime, updatedDate, updatedTime)
                   VALUES (?, ?, CURDATE(), CURTIME(), CURDATE(), CURTIME())`;
        db.query(query, [employeeID, facialDescriptor], callback);
    }
};

module.exports = FacialData;
