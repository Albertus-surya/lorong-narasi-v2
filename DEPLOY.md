# Panduan Deploy Gratis (Node.js + MySQL)

## 1. Siapkan database MySQL gratis
Pilih salah satu:
- **Railway** (railway.app) — bisa tambah plugin MySQL, dapat trial credit.
- **Aiven** (aiven.io) — free plan MySQL.
- **Clever Cloud** — free MySQL kecil.

Dari provider, catat: host, port, user, password, nama database.

## 2. Import struktur & data awal
Jalankan `database/schema.sql` lalu `database/seed.sql` ke database tersebut
(lewat phpMyAdmin/Adminer yang biasanya disediakan provider, atau via CLI mysql).

Atau pakai:
```bash
npm install
node database/seed.js
```
(arahkan dulu `.env` ke kredensial database yang baru).

## 3. Siapkan hosting Node.js gratis
Pilih salah satu:
- **Render** (render.com) — Web Service free tier (akan "sleep" saat idle).
- **Railway** — bisa satu tempat dengan MySQL-nya.
- **Cyclic / Glitch** — alternatif lain untuk proyek kecil.

Set **Environment Variables** di dashboard hosting (jangan upload file `.env`):
```
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
SESSION_SECRET=ganti-dengan-string-acak-panjang
PORT=3000
```
Build command: `npm install`
Start command: `npm start`

## 4. Catatan penting soal upload gambar
`public/uploads/covers` dipakai untuk cover cerita yang diupload lewat admin.
Di hosting gratis (Render/Railway free tier), **filesystem bersifat sementara**:
setiap kali redeploy, file yang diupload lewat admin bisa hilang. Untuk
proyek KKN/demo biasanya tidak masalah, tapi kalau ingin permanen sebaiknya
pindahkan upload ke layanan seperti Cloudinary di kemudian hari.

## 5. Logo yang belum ada
Folder `public/img/` sudah disiapkan (masih kosong). Setelah deploy, tinggal
taruh file berikut lalu redeploy/reupload:
- `logo-partner-1.png`, `logo-partner-2.png` (navbar)
- `logo-mitra-1.png` s/d `logo-mitra-6.png` (footer)

## 6. Yang TIDAK perlu diikutkan saat deploy
- `node_modules/` — install ulang otomatis lewat `npm install` di server.
- `.git/` — riwayat git, tidak dibutuhkan server.
- `.env` — berisi kredensial, jangan pernah di-upload/commit. Isi env lewat
  dashboard hosting, gunakan `.env.example` sebagai referensi.

Ketiganya sudah saya keluarkan dari paket zip ini.
