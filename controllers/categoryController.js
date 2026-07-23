const Category = require('../models/Category');
const Story = require('../models/Story');
const { generateUniqueSlug } = require('../utils/helpers');

const categoryController = {
  async list(req, res) {
    const categories = await Category.findAll();
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        story_count: await Category.countStories(cat.id)
      }))
    );

    res.render('admin/categories/index', {
      title: 'Kelola Kategori',
      layout: 'layouts/admin',
      admin: req.session.admin,
      categories: categoriesWithCount,
      csrfToken: req.csrfToken
    });
  },

  async create(req, res) {
    const { name } = req.body;
    const slug = await generateUniqueSlug(name, (s) => Category.slugExists(s));

    await Category.create({ name, slug });
    await Story.logActivity(req.session.admin.id, 'create', 'category', null, `Created category: ${name}`);
    req.flash('success', 'Kategori berhasil ditambahkan.');
    res.redirect('/admin/categories');
  },

  async update(req, res) {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash('error', 'Kategori tidak ditemukan.');
      return res.redirect('/admin/categories');
    }

    const slug = await generateUniqueSlug(name, (s, id) => Category.slugExists(s, category.id));
    await Category.update(category.id, { name, slug });
    await Story.logActivity(req.session.admin.id, 'update', 'category', category.id, `Updated category: ${name}`);
    req.flash('success', 'Kategori berhasil diperbarui.');
    res.redirect('/admin/categories');
  },

  async delete(req, res) {
    const category = await Category.findById(req.params.id);
    if (!category) {
      req.flash('error', 'Kategori tidak ditemukan.');
      return res.redirect('/admin/categories');
    }

    const storyCount = await Category.countStories(category.id);
    if (storyCount > 0) {
      req.flash('error', `Kategori "${category.name}" masih memiliki ${storyCount} cerita. Pindahkan cerita terlebih dahulu.`);
      return res.redirect('/admin/categories');
    }

    await Category.delete(category.id);
    await Story.logActivity(req.session.admin.id, 'delete', 'category', category.id, `Deleted category: ${category.name}`);
    req.flash('success', 'Kategori berhasil dihapus.');
    res.redirect('/admin/categories');
  }
};

module.exports = categoryController;
