// scripts/testLogin.js
require('dotenv').config();
const Admin = require('../models/Admin');

(async () => {
  const username = 'admin';       // ganti sesuai yang kamu coba
  const password = 'admin123';    // ganti sesuai yang kamu ketik di form

  const admin = await Admin.findByUsername(username);
  console.log('Admin ditemukan:', admin);

  if (!admin) {
    console.log('❌ Username tidak ditemukan di database');
    process.exit();
  }

  const match = await Admin.verifyPassword(password, admin.password);
  console.log('Password cocok?', match);
  process.exit();
})();