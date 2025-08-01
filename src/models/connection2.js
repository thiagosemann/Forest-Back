// connection2.js
const mysql = require('mysql2/promise');
const path = require('path');

// Força o caminho do .env, garantindo que será carregado mesmo com CWD incorreto
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Log para verificar se as variáveis estão sendo carregadas corretamente
console.log('[MYSQL CONNECTION2] Variáveis de ambiente carregadas:', {
  MYSQL_HOST2: process.env.MYSQL_HOST2,
  MYSQL_USER2: process.env.MYSQL_USER2,
  MYSQL_PASSWORD2: process.env.MYSQL_PASSWORD2 ? '***' : undefined,
  MYSQL_DB2: process.env.MYSQL_DB2
});

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST2,
  user: process.env.MYSQL_USER2,
  password: process.env.MYSQL_PASSWORD2,
  database: process.env.MYSQL_DB2,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

module.exports = connection;
