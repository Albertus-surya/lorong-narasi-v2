const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const COVER_FOLDER = 'lorong-narasi/covers';

/**
 * Upload buffer (dari multer memoryStorage) ke Cloudinary.
 * Return object hasil upload Cloudinary (termasuk secure_url & public_id).
 */
function uploadCoverImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: COVER_FOLDER, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

/**
 * Ambil public_id dari sebuah secure_url Cloudinary,
 * supaya bisa dihapus lewat cloudinary.uploader.destroy().
 */
function getPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const afterUpload = url.split('/upload/')[1];
  if (!afterUpload) return null;
  const withoutVersion = afterUpload.replace(/^v\d+\//, '');
  return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
}

/**
 * Hapus cover image lama di Cloudinary (aman dipanggil untuk URL apapun,
 * termasuk placeholder https://placehold.co/... yang otomatis diabaikan).
 */
async function deleteCoverImage(url) {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Gagal menghapus gambar di Cloudinary:', err.message);
  }
}

module.exports = { cloudinary, uploadCoverImage, deleteCoverImage };
