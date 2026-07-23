function isLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu.');
  res.redirect('/admin/login');
}

function isSuperAdmin(req, res, next) {
  if (req.session && req.session.admin && req.session.admin.role === 'superadmin') {
    return next();
  }
  req.flash('error', 'Akses ditolak. Hanya Super Admin yang dapat mengakses halaman ini.');
  res.redirect('/admin/dashboard');
}

function generateCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function validateCsrf(req, res, next) {
  const token = req.body._csrf || req.query._csrf;
  if (!token || token !== req.session.csrfToken) {
    req.flash('error', 'Token CSRF tidak valid. Silakan coba lagi.');
    return res.redirect('back');
  }
  next();
}

module.exports = { isLoggedIn, isSuperAdmin, generateCsrfToken, validateCsrf };
