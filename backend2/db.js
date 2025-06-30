const dotenv = require('dotenv'); //for own configuration environment (like db, pass)
dotenv.config();
const mysql = require('mysql2');

//connection to db with credentials
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

//try to connect
connection.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});

//connection object is exported, so that it can be imported to other files
module.exports = connection;
