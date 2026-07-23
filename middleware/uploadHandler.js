function handleUploadError(err, req, res, next) {
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('error', 'Ukuran file terlalu besar.');
    } else {
      req.flash('error', 'Error upload file: ' + err.message);
    }
    return res.redirect('back');
  }
  if (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  next();
}

module.exports = { handleUploadError };
