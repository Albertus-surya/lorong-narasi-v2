const Admin = require('../models/Admin');

const authController = {
  showLogin(req, res) {
    if (req.session.admin) return res.redirect('/admin/dashboard');
    res.render('admin/login', {
      title: 'Login Admin',
      layout: 'layouts/admin-login',
      csrfToken: req.csrfToken
    });
  },

  async login(req, res) {
    const { username, password } = req.body;
    const admin = await Admin.findByUsername(username);

    if (!admin || !(await Admin.verifyPassword(password, admin.password))) {
      req.flash('error', 'Username atau password salah.');
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: admin.id,
      username: admin.username,
      fullname: admin.fullname,
      role: admin.role
    };

    req.flash('success', `Selamat datang, ${admin.fullname}!`);
    res.redirect('/admin/dashboard');
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  },

  showChangePassword(req, res) {
    res.render('admin/change-password', {
      title: 'Ganti Password',
      layout: 'layouts/admin',
      admin: req.session.admin,
      csrfToken: req.csrfToken
    });
  },

  async changePassword(req, res) {
    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      req.flash('error', 'Konfirmasi password tidak cocok.');
      return res.redirect('/admin/change-password');
    }

    const admin = await Admin.findByUsername(req.session.admin.username);
    if (!(await Admin.verifyPassword(current_password, admin.password))) {
      req.flash('error', 'Password lama tidak benar.');
      return res.redirect('/admin/change-password');
    }

    await Admin.updatePassword(req.session.admin.id, new_password);
    req.flash('success', 'Password berhasil diubah.');
    res.redirect('/admin/dashboard');
  }
};

module.exports = authController;
