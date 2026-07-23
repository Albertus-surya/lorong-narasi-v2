const Story = require('../models/Story');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const { generateUniqueSlug, paginate } = require('../utils/helpers');
const { sanitizeContent } = require('../utils/sanitize');
const { uploadCoverImage, deleteCoverImage } = require('../config/cloudinary');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');

const dashboardController = {
  async index(req, res) {
    const isSuperAdmin = req.session.admin.role === 'superadmin';
    const storyCount = await Story.count();
    const publishedCount = await Story.count('published');
    const draftCount = await Story.count('draft');
    const categoryCount = await Category.count();
    const adminCount = isSuperAdmin ? await Admin.count() : null;
    const categoryStats = await Category.getStoryCounts();
    const monthlyStats = isSuperAdmin ? await Story.getMonthlyStats() : [];

    res.render('admin/dashboard', {
      title: 'Dashboard',
      layout: 'layouts/admin',
      admin: req.session.admin,
      stats: { storyCount, publishedCount, draftCount, categoryCount, adminCount },
      categoryStats,
      monthlyStats,
      isSuperAdmin
    });
  }
};

const storyController = {
  async list(req, res) {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const isSuperAdmin = req.session.admin.role === 'superadmin';
    const { stories, total } = await Story.findAllAdmin(req.session.admin.id, isSuperAdmin, page, perPage);
    const pagination = paginate(total, page, perPage);

    res.render('admin/stories/index', {
      title: 'Daftar Cerita',
      layout: 'layouts/admin',
      admin: req.session.admin,
      stories,
      pagination,
      isSuperAdmin,
      csrfToken: req.csrfToken
    });
  },

  async createForm(req, res) {
    const categories = await Category.findAll();
    res.render('admin/stories/form', {
      title: 'Tambah Cerita',
      layout: 'layouts/admin',
      admin: req.session.admin,
      story: null,
      categories,
      csrfToken: req.csrfToken
    });
  },

  async create(req, res) {
    try {
      const { title, synopsis, category_id, content, content_source, status } = req.body;
      let storyContent = content || '';

      if (content_source === 'pdf' && req.files && req.files.pdf_file) {
        const pdfBuffer = req.files.pdf_file[0].buffer;
        const pdfData = await pdfParse(pdfBuffer);
        storyContent = `<p>${pdfData.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      }

      const slug = await generateUniqueSlug(title, (s) => Story.slugExists(s));
      let imageUrl = 'https://placehold.co/400x300';
      if (req.files && req.files.cover_image) {
        const uploaded = await uploadCoverImage(req.files.cover_image[0].buffer);
        imageUrl = uploaded.secure_url;
      }

      const storyId = await Story.create({
        admin_id: req.session.admin.id,
        category_id: parseInt(category_id),
        title,
        slug,
        synopsis,
        content: sanitizeContent(storyContent),
        image_url: imageUrl,
        status: status || 'draft'
      });

      await Story.logActivity(req.session.admin.id, 'create', 'story', storyId, `Created story: ${title}`);
      req.flash('success', 'Cerita berhasil ditambahkan.');
      res.redirect('/admin/stories');
    } catch (err) {
      req.flash('error', 'Gagal menambahkan cerita: ' + err.message);
      res.redirect('/admin/stories/create');
    }
  },

  async editForm(req, res) {
    const story = await Story.findById(req.params.id);
    if (!story) {
      req.flash('error', 'Cerita tidak ditemukan.');
      return res.redirect('/admin/stories');
    }

    const isSuperAdmin = req.session.admin.role === 'superadmin';
    if (!isSuperAdmin && story.admin_id !== req.session.admin.id) {
      req.flash('error', 'Anda tidak memiliki akses untuk mengedit cerita ini.');
      return res.redirect('/admin/stories');
    }

    const categories = await Category.findAll();
    res.render('admin/stories/form', {
      title: 'Edit Cerita',
      layout: 'layouts/admin',
      admin: req.session.admin,
      story,
      categories,
      csrfToken: req.csrfToken
    });
  },

  async update(req, res) {
    try {
      const story = await Story.findById(req.params.id);
      if (!story) {
        req.flash('error', 'Cerita tidak ditemukan.');
        return res.redirect('/admin/stories');
      }

      const isSuperAdmin = req.session.admin.role === 'superadmin';
      if (!isSuperAdmin && story.admin_id !== req.session.admin.id) {
        req.flash('error', 'Anda tidak memiliki akses untuk mengedit cerita ini.');
        return res.redirect('/admin/stories');
      }

      const { title, synopsis, category_id, content, content_source, status } = req.body;
      let storyContent = content || story.content;

      if (content_source === 'pdf' && req.files && req.files.pdf_file) {
        const pdfBuffer = req.files.pdf_file[0].buffer;
        const pdfData = await pdfParse(pdfBuffer);
        storyContent = `<p>${pdfData.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
      }

      const slug = await generateUniqueSlug(title, (s, id) => Story.slugExists(s, story.id));
      const updateData = {
        title,
        slug,
        synopsis,
        category_id: parseInt(category_id),
        content: sanitizeContent(storyContent),
        status: status || story.status
      };

      if (status === 'published' && story.status !== 'published') {
        updateData.published_at = new Date();
      }

      if (req.files && req.files.cover_image) {
        await deleteCoverImage(story.image_url);
        const uploaded = await uploadCoverImage(req.files.cover_image[0].buffer);
        updateData.image_url = uploaded.secure_url;
      }

      await Story.update(story.id, updateData);
      await Story.logActivity(req.session.admin.id, 'update', 'story', story.id, `Updated story: ${title}`);
      req.flash('success', 'Cerita berhasil diperbarui.');
      res.redirect('/admin/stories');
    } catch (err) {
      req.flash('error', 'Gagal memperbarui cerita: ' + err.message);
      res.redirect(`/admin/stories/edit/${req.params.id}`);
    }
  },

  async publish(req, res) {
    const story = await Story.findById(req.params.id);
    if (!story) {
      req.flash('error', 'Cerita tidak ditemukan.');
      return res.redirect('/admin/stories');
    }

    const isSuperAdmin = req.session.admin.role === 'superadmin';
    if (!isSuperAdmin && story.admin_id !== req.session.admin.id) {
      req.flash('error', 'Anda tidak memiliki akses.');
      return res.redirect('/admin/stories');
    }

    await Story.publish(story.id);
    await Story.logActivity(req.session.admin.id, 'publish', 'story', story.id, `Published story: ${story.title}`);
    req.flash('success', 'Cerita berhasil dipublikasikan.');
    res.redirect('/admin/stories');
  },

  async delete(req, res) {
    if (req.session.admin.role !== 'superadmin') {
      req.flash('error', 'Hanya Super Admin yang dapat menghapus cerita.');
      return res.redirect('/admin/stories');
    }

    try {
      const story = await Story.findById(req.params.id);
      if (!story) {
        req.flash('error', 'Cerita tidak ditemukan.');
        return res.redirect('/admin/stories');
      }

      await Story.delete(story.id);

      // Hapus cover di Cloudinary HANYA setelah baris DB berhasil dihapus,
      // supaya kalau proses delete gagal (misal FK constraint dari tabel lain
      // yang mereferensikan story ini), file cover tidak ikut terhapus sia-sia.
      await deleteCoverImage(story.image_url);

      await Story.logActivity(req.session.admin.id, 'delete', 'story', story.id, `Deleted story: ${story.title}`);
      req.flash('success', 'Cerita berhasil dihapus.');
      res.redirect('/admin/stories');
    } catch (err) {
      console.error('Gagal menghapus cerita:', err);
      req.flash('error', 'Gagal menghapus cerita: ' + err.message);
      res.redirect('/admin/stories');
    }
  },

  async exportPdf(req, res) {
    const story = await Story.findById(req.params.id);
    if (!story) {
      req.flash('error', 'Cerita tidak ditemukan.');
      return res.redirect('/admin/stories');
    }
    return exportStoryPdf(story, res);
  },

  async exportPdfBySlug(req, res) {
    const story = await Story.findBySlug(req.params.slug);
    if (!story || story.status !== 'published') {
      return res.status(404).render('errors/404', {
        title: 'Cerita Tidak Ditemukan',
        layout: 'layouts/public'
      });
    }
    return exportStoryPdf(story, res);
  }
};

function exportStoryPdf(story, res) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${story.slug}.pdf"`);
    doc.pipe(res);

    doc.fontSize(24).text(story.title, { align: 'center' });
    doc.moveDown();
    if (story.category_name) {
      doc.fontSize(12).fillColor('#666').text(`Kategori: ${story.category_name}`, { align: 'center' });
    }
    doc.moveDown();
    if (story.synopsis) {
      doc.fontSize(11).fillColor('#333').text(story.synopsis, { align: 'justify' });
      doc.moveDown();
    }
    doc.moveDown();

    const plainContent = story.content
      ? story.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    doc.fontSize(11).fillColor('#000').text(plainContent, { align: 'justify', lineGap: 4 });

    doc.end();
}

module.exports = { dashboardController, storyController };