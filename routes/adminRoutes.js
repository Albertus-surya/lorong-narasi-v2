const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { dashboardController, storyController } = require('../controllers/storyController');
const categoryController = require('../controllers/categoryController');
const userController = require('../controllers/userController');
const { isLoggedIn, isSuperAdmin, validateCsrf } = require('../middleware/auth');
const { storyUpload } = require('../config/multer');
const { handleUploadError } = require('../middleware/uploadHandler');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
});

router.get('/login', authController.showLogin);
router.post('/login', loginLimiter, validateCsrf, authController.login);
router.get('/logout', authController.logout);

router.use(isLoggedIn);

router.get('/dashboard', dashboardController.index);
router.get('/change-password', authController.showChangePassword);
router.post('/change-password', validateCsrf, authController.changePassword);

router.get('/stories', storyController.list);
router.get('/stories/create', storyController.createForm);
router.post('/stories/create', storyUpload, handleUploadError, validateCsrf, storyController.create);
router.get('/stories/edit/:id', storyController.editForm);
router.post('/stories/edit/:id', storyUpload, handleUploadError, validateCsrf, storyController.update);
router.post('/stories/publish/:id', validateCsrf, storyController.publish);
router.post('/stories/delete/:id', validateCsrf, storyController.delete);
router.get('/stories/:id/export-pdf', storyController.exportPdf);

router.use(isSuperAdmin);

router.get('/categories', categoryController.list);
router.post('/categories/create', validateCsrf, categoryController.create);
router.post('/categories/edit/:id', validateCsrf, categoryController.update);
router.post('/categories/delete/:id', validateCsrf, categoryController.delete);

router.get('/users', userController.list);
router.post('/users/create', validateCsrf, userController.create);
router.post('/users/edit/:id', validateCsrf, userController.update);
router.post('/users/reset-password/:id', validateCsrf, userController.resetPassword);
router.post('/users/delete/:id', validateCsrf, userController.delete);

module.exports = router;
