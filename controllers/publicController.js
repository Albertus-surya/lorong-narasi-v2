const Story = require('../models/Story');
const Category = require('../models/Category');
const { truncate, paginate } = require('../utils/helpers');

const publicController = {
  async home(req, res) {
    const latestStories = await Story.findLatest(3);
    const categories = await Category.findAll();
    const categoryCounts = await Category.getStoryCounts();

    const highlights = [];
    for (const cat of categories) {
      const stories = await Story.findTopByCategory(cat.id, 2);
      if (stories.length > 0) {
        highlights.push({ category: cat, stories });
      }
    }

    res.render('public/home', {
      title: 'Beranda',
      layout: 'layouts/public',
      latestStories,
      categories,
      categoryCounts,
      highlights,
      truncate
    });
  },

  async storyDetail(req, res) {
    const story = await Story.findBySlug(req.params.slug);
    if (!story || story.status !== 'published') {
      return res.status(404).render('errors/404', {
        title: 'Cerita Tidak Ditemukan',
        layout: 'layouts/public'
      });
    }

    const navigation = await Story.getPrevNext(story.id, story.category_id, story.published_at);

    res.render('public/story-detail', {
      title: story.title,
      layout: 'layouts/public',
      story,
      navigation
    });
  },

  async storyRead(req, res) {
    const story = await Story.findBySlug(req.params.slug);
    if (!story || story.status !== 'published') {
      return res.status(404).render('errors/404', {
        title: 'Cerita Tidak Ditemukan',
        layout: 'layouts/public'
      });
    }

    const navigation = await Story.getPrevNext(story.id, story.category_id, story.published_at);

    res.render('public/story-read', {
      title: story.title,
      layout: 'layouts/public',
      story,
      navigation
    });
  },

  async categoryList(req, res) {
    const category = await Category.findBySlug(req.params.slug);
    if (!category) {
      return res.status(404).render('errors/404', {
        title: 'Kategori Tidak Ditemukan',
        layout: 'layouts/public'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const { stories, total } = await Story.findByCategory(category.id, page, perPage);
    const pagination = paginate(total, page, perPage);

    res.render('public/category', {
      title: category.name,
      layout: 'layouts/public',
      category,
      stories,
      pagination,
      truncate
    });
  },

  async search(req, res) {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    let stories = [];
    let pagination = paginate(0, 1, perPage);

    if (query.trim()) {
      const result = await Story.search(query.trim(), page, perPage);
      stories = result.stories;
      pagination = paginate(result.total, page, perPage);
    }

    res.render('public/search', {
      title: 'Pencarian',
      layout: 'layouts/public',
      query,
      stories,
      pagination,
      truncate
    });
  },

  profile(req, res) {
    const teamData = {
      dosen: {
        name: 'Dr. Makhfudli., S. Kep. Ns., M. Ked. Trop., M.H. Kes., CMC',
        photo: '/img/team/dosen.png',
        description: 'Dosen Pembimbing Lapangan'
      },
      members: [
      {
        name: 'Johan Musa Pasalbessy',
        role: 'Ketua',
        photo: '/img/team/Johan-Pasallbesy.png',
        description: 'Mahasiswa Kedokteran Hewan (NIM: 161231097)'
      },
      {
        name: 'Nabil Satyarji Wiramahdi',
        role: 'Sekretaris',
        photo: '/img/team/Nabil-Satyarji.png',
        description: 'Mahasiswa Farmasi (NIM: 151231202)'
      },
      {
        name: 'Sintana Dewi Mustika Sari',
        role: 'Bendahara',
        photo: '/img/team/Sintana-Dewi.png',
        description: 'Mahasiswa Farmasi (NIM: 151231003)'
      },
      {
        name: 'Gracella Puspita Naomi Sitorus',
        role: 'PDD',
        photo: '/img/team/Gracella-Puspita.png',
        description: 'Mahasiswa Fakultas Ilmu Sosial Dan Ilmu Politik (NIM: 177231078)'
      },
      {
        name: 'Nashwa Ammara Rizkyantika',
        role: 'PDD',
        photo: '/img/team/Nashwa-Amara.png',
        description: 'Mahasiswa Fakultas Kedokteran (NIM: 111231125)'
      },
      {
        name: 'Rizky Amanda Putri',
        role: 'Acara',
        photo: '/img/team/Rizky-Amanda.png',
        description: 'Mahasiswa Fakultas Kedokteran (NIM: 111231286)'
      },
      {
        name: 'Hymmas Hanum Tsalatsa',
        role: 'Acara',
        photo: '/img/team/Hanum-Tsalsa.png',
        description: 'Mahasiswa Sains dan Teknologi (NIM: 183231044)'
      },
      {
        name: 'Andhika Eric Saputra',
        role: 'Perlengkapan',
        photo: '/img/team/Andhika-Eric.png',
        description: 'Mahasiswa Vokasi (NIM: 422231045)'
      },
      {
        name: 'Happy Mutiara Rahmawati',
        role: 'Humas',
        photo: '/img/team/Happy-Mutiara.png',
        description: 'Mahasiswa Fakultas Ekonomi dan Bisnis (NIM: 142241030)'
      }
    ]
    };

    res.render('public/profile', {
      title: 'Profil Tim',
      layout: 'layouts/public',
      teamData
    });
  }
};

module.exports = publicController;
