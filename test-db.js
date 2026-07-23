require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Mencoba konek ke:', process.env.DB_HOST, process.env.DB_PORT);
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 20000 // 20 detik, biar lebih sabar
    });
    console.log('BERHASIL');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query test:', rows);
    await connection.end();
  } catch (err) {
    console.error('GAGAL:', err.code, err.message);
  }
}

testConnection();