const pool = require('../config/db');

const Story = {
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug,
             a.fullname as admin_name
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN admins a ON s.admin_id = a.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug,
             a.fullname as admin_name
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN admins a ON s.admin_id = a.id
      WHERE s.slug = ?
    `, [slug]);
    return rows[0] || null;
  },

  async slugExists(slug, excludeId = null) {
    let query = 'SELECT id FROM stories WHERE slug = ?';
    const params = [slug];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  },

  async findLatest(limit = 3) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.status = 'published'
      ORDER BY s.published_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  },

  async findByCategory(categoryId, page = 1, perPage = 10, publishedOnly = true) {
    const offset = (page - 1) * perPage;
    let whereClause = 'WHERE s.category_id = ?';
    const params = [categoryId];

    if (publishedOnly) {
      whereClause += " AND s.status = 'published'";
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM stories s ${whereClause}`,
      params
    );

    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      ${whereClause}
      ORDER BY s.published_at DESC, s.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, perPage, offset]);

    return { stories: rows, total: countResult[0].total };
  },

  async findTopByCategory(categoryId, limit = 2) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.category_id = ? AND s.status = 'published'
      ORDER BY s.published_at DESC
      LIMIT ?
    `, [categoryId, limit]);
    return rows;
  },

  async search(query, page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;
    const searchTerm = `%${query}%`;

    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM stories
      WHERE status = 'published' AND (title LIKE ? OR synopsis LIKE ?)
    `, [searchTerm, searchTerm]);

    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, c.slug as category_slug
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.status = 'published' AND (s.title LIKE ? OR s.synopsis LIKE ?)
      ORDER BY s.published_at DESC
      LIMIT ? OFFSET ?
    `, [searchTerm, searchTerm, perPage, offset]);

    return { stories: rows, total: countResult[0].total };
  },

  async findAllAdmin(adminId, isSuperAdmin, page = 1, perPage = 10) {
    const offset = (page - 1) * perPage;
    let whereClause = '';
    const params = [];

    if (!isSuperAdmin) {
      whereClause = 'WHERE s.admin_id = ?';
      params.push(adminId);
    }

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM stories s ${whereClause}`,
      params
    );

    const [rows] = await pool.query(`
      SELECT s.*, c.name as category_name, a.fullname as admin_name
      FROM stories s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN admins a ON s.admin_id = a.id
      ${whereClause}
      ORDER BY s.updated_at DESC
      LIMIT ? OFFSET ?
    `, [...params, perPage, offset]);

    return { stories: rows, total: countResult[0].total };
  },

  async count(status = null) {
    if (status) {
      const [rows] = await pool.query('SELECT COUNT(*) as total FROM stories WHERE status = ?', [status]);
      return rows[0].total;
    }
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM stories');
    return rows[0].total;
  },

  async getMonthlyStats() {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(published_at, '%Y-%m') as month, COUNT(*) as count
      FROM stories
      WHERE status = 'published' AND published_at IS NOT NULL
      GROUP BY DATE_FORMAT(published_at, '%Y-%m')
      ORDER BY month ASC
      LIMIT 12
    `);
    return rows;
  },

  async getPrevNext(storyId, categoryId, publishedAt) {
    const [prev] = await pool.query(`
      SELECT id, title, slug FROM stories
      WHERE category_id = ? AND status = 'published'
        AND published_at < ?
      ORDER BY published_at DESC LIMIT 1
    `, [categoryId, publishedAt]);

    const [next] = await pool.query(`
      SELECT id, title, slug FROM stories
      WHERE category_id = ? AND status = 'published'
        AND published_at > ?
      ORDER BY published_at ASC LIMIT 1
    `, [categoryId, publishedAt]);

    return { prev: prev[0] || null, next: next[0] || null };
  },

  async create(data) {
    const [result] = await pool.query(`
      INSERT INTO stories (admin_id, category_id, title, slug, synopsis, content, image_url, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.admin_id, data.category_id, data.title, data.slug,
      data.synopsis, data.content, data.image_url, data.status,
      data.status === 'published' ? new Date() : null
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    await pool.query(`UPDATE stories SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async publish(id) {
    await pool.query(
      "UPDATE stories SET status = 'published', published_at = NOW() WHERE id = ?",
      [id]
    );
  },

  async delete(id) {
    await pool.query('DELETE FROM stories WHERE id = ?', [id]);
  },

  async logActivity(adminId, action, entityType, entityId, details) {
  try {
    await pool.query(
      'INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [adminId, action, entityType, entityId, details]
    );
  } catch (err) {
    console.error('Gagal mencatat activity log:', err.message);
    // sengaja tidak di-throw ulang, supaya aksi utama tetap lanjut
  }
}
};

module.exports = Story;
