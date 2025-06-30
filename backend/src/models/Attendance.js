const db = require('../config/dbConfig');
const Attendance = {
    getByEmployeeIdAndDate: (employeeID, date, callback) => {
        const query = 'SELECT * FROM attendance WHERE employeeID = ? AND date = ?';
        db.query(query, [employeeID, date], callback);
    },

    punchIn: (employeeID, date, time, callback) => {
        const query = 'INSERT INTO attendance (employeeID, date, punch_in_time) VALUES (?, ?, ?)';
        db.query(query, [employeeID, date, time], callback);
    },

    punchOut: (employeeID, date, time, callback) => {
        const query = 'UPDATE attendance SET punch_out_time = ? WHERE employeeID = ? AND date = ?';
        db.query(query, [time, employeeID, date], callback);
    },

    getAllByEmployeeId: (employeeID, callback) => {
        const query = 'SELECT * FROM attendance WHERE employeeID = ?';
        db.query(query, [employeeID], callback);
    }
};

module.exports = Attendance;
