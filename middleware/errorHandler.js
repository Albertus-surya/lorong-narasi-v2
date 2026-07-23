function notFound(req, res) {
  res.status(404).render('errors/404', {
    title: 'Halaman Tidak Ditemukan',
    layout: 'layouts/public'
  });
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Terjadi kesalahan pada server.'
    : err.message;

  if (req.path.startsWith('/admin')) {
    return res.status(status).render('errors/500', {
      title: 'Kesalahan Server',
      layout: 'layouts/admin',
      message,
      admin: req.session.admin || null
    });
  }

  res.status(status).render('errors/500', {
    title: 'Kesalahan Server',
    layout: 'layouts/public',
    message
  });
}

module.exports = { notFound, errorHandler };
