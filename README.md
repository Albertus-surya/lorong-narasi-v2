# Lorong Narasi

Platform perpustakaan digital untuk membaca cerita nusantara — dongeng, legenda, fabel, dan mitos.

## Tech Stack

- **Backend:** Express.js (MVC)
- **Database:** MySQL
- **View Engine:** EJS
- **Frontend:** CSS Native + Vanilla JS + Chart.js + CKEditor 5

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi database

Salin `.env.example` ke `.env` dan sesuaikan kredensial MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lorong_narasi
SESSION_SECRET=your-secret-key
PORT=3000
```

### 3. Buat database & seed data

```bash
node database/seed.js
```

### 4. Jalankan server

```bash
npm start
# atau development mode:
npm run dev
```

Buka http://localhost:3000

## Akun Default

| Role | Username | Password |
|------|----------|----------|
| Super Admin | superadmin | admin123 |
| Admin | admin | admin123 |

## Struktur URL

### Public
- `/` — Beranda
- `/profile` — Profil tim KKN
- `/cerita/:slug` — Detail cerita
- `/kategori/:slug` — Cerita per kategori
- `/cari?q=...` — Pencarian

### Admin
- `/admin/login` — Login
- `/admin/dashboard` — Dashboard
- `/admin/stories` — Kelola cerita
- `/admin/categories` — Kelola kategori (Super Admin)
- `/admin/users` — Kelola admin (Super Admin)

## Fitur

- Role-based access (Guest, Admin, Super Admin)
- CRUD cerita dengan CKEditor 5 & import PDF
- Export cerita ke PDF (PDFKit)
- Upload cover image (Multer)
- Dashboard statistik dengan Chart.js
- Dark/Light mode toggle
- CSRF protection, rate limiting, session persistence
- HTML sanitization (sanitize-html)
- Pagination & pencarian
- Activity logging
