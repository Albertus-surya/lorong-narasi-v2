require('dotenv').config();
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generateCsrfToken } = require('./middleware/auth');

const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,   
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lorong_narasi',
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  ssl: {
    rejectUnauthorized: false
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/public');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  key: 'lorong_session',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000, httpOnly: true }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.admin = req.session.admin || null;
  req.csrfToken = generateCsrfToken(req);
  res.locals.csrfToken = req.csrfToken;
  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Di Vercel, app TIDAK boleh listen sendiri (Vercel yang menangani request
// lewat api/index.js). Untuk run lokal (npm start) tetap listen seperti biasa.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Lorong Narasi running at http://localhost:${PORT}`);
  });
}

module.exports = app;
