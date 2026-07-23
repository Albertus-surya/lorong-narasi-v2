const pool = require('../config/db');

const Category = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = null) {
    let query = 'SELECT id FROM categories WHERE slug = ?';
    const params = [slug];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  },

  async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM categories');
    return rows[0].total;
  },

  async countStories(categoryId, publishedOnly = false) {
    let query = 'SELECT COUNT(*) as total FROM stories WHERE category_id = ?';
    const params = [categoryId];
    if (publishedOnly) {
      query += " AND status = 'published'";
    }
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  async getStoryCounts() {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.slug, COUNT(s.id) as story_count
      FROM categories c
      LEFT JOIN stories s ON c.id = s.category_id AND s.status = 'published'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    return rows;
  },

  async create({ name, slug }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?)',
      [name, slug]
    );
    return result.insertId;
  },

  async update(id, { name, slug }) {
    await pool.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  }
};

module.exports = Category;
