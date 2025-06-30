const mysql = require('mysql2');
const dotenv = require('dotenv').config();
const util = require('util')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});


pool.getConnection((err, connection) => {
    if (err) {
        console.log(process.env.DB_HOST,"process.env.DB_HOST");
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    } else {
        console.log("DONE!");
    }

    if (connection) {
        connection.release();
    }
    return false;
});

pool.query = util.promisify(pool.query);

module.exports = pool;