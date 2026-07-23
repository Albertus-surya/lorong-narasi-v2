const Admin = require('../models/Admin');
const Story = require('../models/Story');
const { paginate } = require('../utils/helpers');

const userController = {
  async list(req, res) {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const { admins, total } = await Admin.findAll(page, perPage);
    const pagination = paginate(total, page, perPage);

    res.render('admin/users/index', {
      title: 'Kelola Admin',
      layout: 'layouts/admin',
      admin: req.session.admin,
      admins,
      pagination,
      csrfToken: req.csrfToken
    });
  },

  async create(req, res) {
    const { username, password, fullname, role } = req.body;

    const existing = await Admin.findByUsername(username);
    if (existing) {
      req.flash('error', 'Username sudah digunakan.');
      return res.redirect('/admin/users');
    }

    await Admin.create({ username, password, fullname, role: role || 'admin' });
    await Story.logActivity(req.session.admin.id, 'create', 'admin', null, `Created admin: ${username}`);
    req.flash('success', 'Admin berhasil ditambahkan.');
    res.redirect('/admin/users');
  },

  async update(req, res) {
    const { username, fullname, role } = req.body;
    const targetAdmin = await Admin.findById(req.params.id);

    if (!targetAdmin) {
      req.flash('error', 'Admin tidak ditemukan.');
      return res.redirect('/admin/users');
    }

    if (targetAdmin.id === req.session.admin.id && role !== targetAdmin.role) {
      req.flash('error', 'Anda tidak dapat mengubah role sendiri.');
      return res.redirect('/admin/users');
    }

    await Admin.update(targetAdmin.id, { username, fullname, role });
    await Story.logActivity(req.session.admin.id, 'update', 'admin', targetAdmin.id, `Updated admin: ${username}`);
    req.flash('success', 'Admin berhasil diperbarui.');
    res.redirect('/admin/users');
  },

  async resetPassword(req, res) {
    const { new_password } = req.body;
    const targetAdmin = await Admin.findById(req.params.id);

    if (!targetAdmin) {
      req.flash('error', 'Admin tidak ditemukan.');
      return res.redirect('/admin/users');
    }

    await Admin.updatePassword(targetAdmin.id, new_password);
    await Story.logActivity(req.session.admin.id, 'reset_password', 'admin', targetAdmin.id, `Reset password for: ${targetAdmin.username}`);
    req.flash('success', `Password ${targetAdmin.fullname} berhasil direset.`);
    res.redirect('/admin/users');
  },

  async delete(req, res) {
    const targetAdmin = await Admin.findById(req.params.id);

    if (!targetAdmin) {
      req.flash('error', 'Admin tidak ditemukan.');
      return res.redirect('/admin/users');
    }

    if (targetAdmin.id === req.session.admin.id) {
      req.flash('error', 'Anda tidak dapat menghapus akun sendiri.');
      return res.redirect('/admin/users');
    }

    await Admin.delete(targetAdmin.id);
    await Story.logActivity(req.session.admin.id, 'delete', 'admin', targetAdmin.id, `Deleted admin: ${targetAdmin.username}`);
    req.flash('success', 'Admin berhasil dihapus.');
    res.redirect('/admin/users');
  }
};

module.exports = userController;
