const mysql = require('mysql2/promise');
require('dotenv').config();
const connection = mysql.createPool({
    host: process.env.MYSQL_HOST2,
    user: process.env.MYSQL_USER2,
    password: process.env.MYSQL_PASSWORD2,
    database: process.env.MYSQL_DB2,
    ssl: {  rejectUnauthorized: true  }

});

module.exports = connection;
