require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await connection.query('USE lorong_narasi');
  await connection.query('DELETE FROM activity_logs');
  await connection.query('DELETE FROM stories');
  await connection.query('DELETE FROM categories');
  await connection.query('DELETE FROM admins');

  await connection.query(
    'INSERT INTO admins (username, password, fullname, role) VALUES (?, ?, ?, ?)',
    ['superadmin', hashedPassword, 'Super Administrator', 'superadmin']
  );

  await connection.query(
    'INSERT INTO admins (username, password, fullname, role) VALUES (?, ?, ?, ?)',
    ['admin', hashedPassword, 'Admin Lorong Narasi', 'admin']
  );

  const categories = [
    ['Dongeng', 'dongeng'],
    ['Legenda', 'legenda'],
    ['Cerita Rakyat', 'cerita-rakyat'],
    ['Fabel', 'fabel'],
    ['Mitos', 'mitos']
  ];

  for (const [name, slug] of categories) {
    await connection.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  }

  const [admins] = await connection.query('SELECT id FROM admins WHERE username = ?', ['admin']);
  const adminId = admins[0].id;

  const sampleStories = [
    {
      title: 'Sang Kancil dan Buaya',
      slug: 'sang-kancil-dan-buaya',
      synopsis: 'Cerita fabel tentang kecerdikan Kancil yang berhasil menyeberangi sungai dengan tipu muslihatnya.',
      content: '<p>Dahulu kala, di hutan yang lebat, hiduplah seekor Kancil yang terkenal cerdik. Suatu hari, Kancil ingin menyeberangi sungai yang penuh buaya...</p>',
      category_id: 4,
      status: 'published'
    },
    {
      title: 'Malin Kundang',
      slug: 'malin-kundang',
      synopsis: 'Legenda anak durhaka yang dikutuk menjadi batu karena tidak mengakui ibunya.',
      content: '<p>Di sebuah desa nelayan di pesisir Sumatera Barat, hiduplah seorang janda dengan anak laki-lakinya bernama Malin Kundang...</p>',
      category_id: 2,
      status: 'published'
    },
    {
      title: 'Timun Mas',
      slug: 'timun-mas',
      synopsis: 'Dongeng tentang gadis cantik yang lahir dari timun emas dan melawan raksasa jahat.',
      content: '<p>Di desa yang jauh, hiduplah sepasang suami istri tua yang sangat ingin memiliki anak. Mereka berdoa setiap hari...</p>',
      category_id: 1,
      status: 'published'
    },
    {
      title: 'Roro Jonggrang',
      slug: 'roro-jonggrang',
      synopsis: 'Legenda asal-usul Candi Prambanan dan kisah cinta tragis Roro Jonggrang.',
      content: '<p>Di kerajaan Pengging, hiduplah seorang putri cantik bernama Roro Jonggrang. Kerajaannya diserang oleh Bandung Bondowoso...</p>',
      category_id: 2,
      status: 'published'
    },
    {
      title: 'Sangkuriang',
      slug: 'sangkuriang',
      synopsis: 'Legenda terbentuknya Gunung Tangkuban Perahu dari kisah cinta terlarang.',
      content: '<p>Sangkuriang adalah seorang pemuda gagah berani yang tidak mengetahui bahwa Dayang Sumbi yang ia cintai adalah ibunya sendiri...</p>',
      category_id: 2,
      status: 'published'
    }
  ];

  for (const story of sampleStories) {
    await connection.query(
      `INSERT INTO stories (admin_id, category_id, title, slug, synopsis, content, image_url, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [adminId, story.category_id, story.title, story.slug, story.synopsis, story.content,
       'https://placehold.co/400x300', story.status]
    );
  }

  console.log('Database seeded successfully!');
  console.log('Super Admin: superadmin / admin123');
  console.log('Admin: admin / admin123');
  await connection.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
