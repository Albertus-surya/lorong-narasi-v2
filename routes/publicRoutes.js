const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { storyController } = require('../controllers/storyController');

router.get('/', publicController.home);
router.get('/profile', publicController.profile);
router.get('/cerita/:slug', publicController.storyDetail);
router.get('/cerita/:slug/baca', publicController.storyRead);
router.get('/kategori/:slug', publicController.categoryList);
router.get('/cari', publicController.search);
router.get('/cerita/:slug/export-pdf', storyController.exportPdfBySlug);

module.exports = router;
