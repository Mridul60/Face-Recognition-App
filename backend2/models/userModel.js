{/*
// models/Employee.js
const db = require('../db');

const Employee = {
  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM employee WHERE email = ?';
    db.query(query, [email], callback);
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM employee WHERE id = ?';
    db.query(query, [id], callback);
  },

  getAll: (callback) => {
    db.query('SELECT * FROM employee', callback);
  },

  create: (name, email, password, callback) => {
    const query = 'INSERT INTO employee (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, password], callback);
  }
};

module.exports = Employee;


// models/OfficeLocation.js
const db = require('../db');

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


// models/FacialData.js
const db = require('../db');

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


// models/Attendance.js
const db = require('../db');

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

* */}