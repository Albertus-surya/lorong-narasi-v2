// Entry point serverless untuk Vercel.
// Semua request (termasuk asset static di /public) diarahkan ke sini,
// lalu ditangani oleh Express app yang sama seperti waktu jalan lokal.
module.exports = require('../app');
