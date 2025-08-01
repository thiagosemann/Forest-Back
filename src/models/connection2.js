// connection2.js
const mysql = require('mysql2/promise');
const path = require('path');

// Força o caminho do .env, garantindo que será carregado mesmo com CWD incorreto
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST2,
  user: process.env.MYSQL_USER2,
  password: process.env.MYSQL_PASSWORD2,
  database: process.env.MYSQL_DB2,
  ssl: { rejectUnauthorized: true }

});

module.exports = connection;
