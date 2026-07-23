const pool = require('../config/db');
const bcrypt = require('bcrypt');

const Admin = {
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT id, username, fullname, role, created_at FROM admins WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findAll(page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM admins');
    const [rows] = await pool.query(
      'SELECT id, username, fullname, role, created_at FROM admins ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [perPage, offset]
    );
    return { admins: rows, total: countResult[0].total };
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM admins');
    return rows[0].total;
  },

  async create({ username, password, fullname, role }) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (username, password, fullname, role) VALUES (?, ?, ?, ?)',
      [username, hash, fullname, role]
    );
    return result.insertId;
  },

  async update(id, { username, fullname, role }) {
    await pool.query(
      'UPDATE admins SET username = ?, fullname = ?, role = ? WHERE id = ?',
      [username, fullname, role, id]
    );
  },

  async updatePassword(id, password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hash, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM admins WHERE id = ?', [id]);
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
};

module.exports = Admin;
