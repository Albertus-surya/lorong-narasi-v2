const multer = require('multer');
const path = require('path');

// Semua upload disimpan di memori (buffer), TIDAK ditulis ke disk.
// - cover_image -> nanti di-upload ke Cloudinary (lihat config/cloudinary.js)
// - pdf_file    -> langsung diproses dari buffer oleh pdf-parse
// Ini wajib untuk Vercel (serverless, tidak ada disk permanen) dan juga
// lebih aman untuk hosting lain karena tidak bergantung pada filesystem.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'cover_image') {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(ext)) return cb(null, true);
    return cb(new Error('Hanya file JPG, PNG, atau WEBP yang diperbolehkan untuk cover'), false);
  }

  if (file.fieldname === 'pdf_file') {
    if (ext === '.pdf') return cb(null, true);
    return cb(new Error('Hanya file PDF yang diperbolehkan'), false);
  }

  cb(new Error('Field file tidak dikenali'), false);
};

const storyUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB (cukup untuk cover & pdf)
  fileFilter
}).fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]);

module.exports = { storyUpload };
