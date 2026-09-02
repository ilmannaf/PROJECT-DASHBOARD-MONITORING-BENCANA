# BPBD Dashboard Monitoring Bencana

Sistem dashboard monitoring kebencanaan untuk BPBD Kota Semarang. Memungkinkan pelaporan bencana dari masyarakat dan pengelolaan laporan oleh petugas/admin — mulai dari laporan masuk, pendataan bencana, hingga ekspor dokumen PDF resmi.

---

## Struktur Project

```
PROJECT-DASHBOARD-MONITORING-BENCANA/
├── backend/          # Node.js/Express REST API
├── frontend/         # React + Vite Dashboard
└── mobile/           # React Native (planned)
```

---

## Tech Stack

### Backend
- Node.js + Express 5
- MySQL (mysql2)
- JWT Authentication + Bcrypt
- Socket.IO (real-time)
- Multer (file upload)
- PDFKit (generasi dokumen PDF)

### Frontend
- React 19.2 + Vite 8.2
- Tailwind CSS v4
- React Router DOM 7.18
- Axios + Socket.IO Client
- Recharts (data visualization)
- Leaflet (peta interaktif)
- Lucide React (icons)
- Framer Motion (page transitions)

---

## Setup & Installation

### Prerequisites
- Node.js 18+ & npm
- MySQL 8.0+
- Git

### 1. Database Setup

```bash
mysql -u root -p
CREATE DATABASE sistem_kebencanaan;
USE sistem_kebencanaan;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
SOURCE backend/database/migration_activity_time.sql;
SOURCE backend/database/migration_info_board.sql;
SOURCE backend/database/seed_info_board.sql;
```

Jika database sudah ada sebelumnya, jalankan migration di `backend/database/` sesuai urutan.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sistem_kebencanaan
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### 4. Build Production

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm run preview
```

---

## Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@ilmannafia.go.id | admin123 | admin |
| petugas@bpbdsemarang.go.id | admin123 | petugas |

---

## URL Mapping

### Public (Tanpa Login)
| URL | Deskripsi |
|-----|-----------|
| `/` | Landing page — hero, statistik, dokumentasi |
| `/tentang` | Halaman Tentang Kami (profil BPBD) |
| `/lapor` | Form pelaporan bencana (max 5 foto, GPS opsional) |
| `/lacak` | Tracking laporan dengan kode unik |
| `/peta` | Peta sebaran bencana publik (filter & marker warna) |

### Admin
| URL | Deskripsi |
|-----|-----------|
| `/admin/login` | Login admin/petugas |
| `/admin/dashboard` | Dashboard admin |
| `/admin/reports` | Kelola laporan |
| `/admin/disaster-records` | Pendataan bencana + download PDF |
| `/admin/inventory` | Manajemen inventaris |
| `/admin/vehicles` | Manajemen kendaraan |
| `/admin/posko` | Manajemen posko |
| `/admin/activities` | Laporan kegiatan lapangan |
| `/admin/users` | Manajemen akun |
| `/admin/login-history` | Histori login |

---

## Fitur Utama

### Public
- Landing page modern — hero full-bleed, section statistik (AnimatedNumber + recharts), dokumentasi galeri 3D coverflow
- Halaman Tentang Kami — profil BPBD, visi misi, nilai & komitmen
- Laporan bencana — form dengan peta interaktif (klik/drag marker), GPS opsional, upload max 5 foto
- Tracking status — kode unik `BPBD-2026-XXXX` + peta lokasi & galeri foto
- Peta sebaran — filter jenis/status, marker warna per bencana
- Section Kontak — Google Maps embed, nomor darurat 24/7

### Admin
- Admin sidebar — dark mode (bg-gray-900), orange active indicator, mobile drawer
- Dashboard — statistik & charts (Recharts) dengan AnimatedNumber count-up
- Kelola laporan — update status, filter, assign petugas, hapus, preview foto & koordinat
- Pendataan bencana — formulir detail (kronologi, korban, terdampak, kerugian)
- Download PDF — ekspor formulir pendataan sebagai dokumen resmi BPBD
- Inventaris — CRUD lengkap (tambah, edit, hapus, ubah kondisi)
- Kendaraan — fleet management dengan status service
- Posko — kelola titik posko pengungsian
- Kegiatan — laporan kegiatan lapangan dengan waktu (jam) + fitur edit
- Papan Informasi — jadwal internal staff (CRUD + tampilan fullscreen untuk display)
- Manajemen akun — role selection & password confirmation
- Histori login — info perangkat yang readable

### Highlight
- WhatsApp Float Button — tombol chat di pojok kanan bawah (seluruh halaman)
- Clean UI / Natural Design — styling minimalis, ikon halus (strokeWidth 1.5)
- Animasi konsisten — page transitions (Framer Motion), stagger entrance, skeleton loading, micro-interactions
- `prefers-reduced-motion` respected untuk accessibility
- Role-based authorization (admin/petugas)
- Dark mode toggle pada Papan Informasi (localStorage persistence)
- Fullscreen API untuk display papan informasi (sidebar tersembunyi)
- Keyboard shortcuts — `F` fullscreen, `D` toggle dark mode

---

## Database Schema

| Table | Deskripsi |
|-------|-----------|
| `users` | Admin & petugas BPBD |
| `login_history` | Histori login admin |
| `reports` | Laporan bencana dari publik |
| `report_photos` | Foto multiple max 5 per laporan |
| `report_logs` | History perubahan status |
| `posko` | Lokasi posko pengungsian |
| `inventory_items` | Logistik & peralatan |
| `vehicles` | Kendaraan BPBD |
| `activities` | Laporan kegiatan lapangan |
| `info_board` | Papan informasi jadwal internal (waktu, lokasi, deskripsi) |
| `disaster_records` | Pendataan bencana (kronologi, korban, terdampak, kerugian) |

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/history` - Histori login (admin)

### Reports
- `POST /api/reports` - Submit laporan (publik, multipart max 5 foto, koordinat opsional)
- `GET /api/reports/public` - List untuk peta sebaran (publik)
- `GET /api/reports` - List semua laporan (admin/petugas)
- `GET /api/reports/my-reports` - Laporan user yang login
- `GET /api/reports/track/:code` - Cek status via tracking code (publik)
- `PATCH /api/reports/:id/status` - Update status (admin/petugas)
- `DELETE /api/reports/:id` - Hapus laporan + foto (admin/petugas)

### Disaster Records
- `GET /api/disaster-records` - List pendataan
- `GET /api/disaster-records/:id` - Detail pendataan
- `GET /api/disaster-records/:id/pdf` - Download PDF
- `POST /api/disaster-records` - Tambah pendataan
- `PUT /api/disaster-records/:id` - Update pendataan (admin)
- `DELETE /api/disaster-records/:id` - Hapus pendataan (admin)

### Public Stats
- `GET /api/public/stats` - Statistik ringkasan (total, byStatus, byType)
- `GET /api/public/stats/monthly` - Jumlah laporan per bulan
- `GET /api/public/stats/monthly/by-type` - Breakdown jenis bencana per bulan

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Tambah (admin)
- `PATCH /api/inventory/:id` - Update
- `DELETE /api/inventory/:id` - Hapus

### Vehicles
- `GET /api/vehicles` - List kendaraan
- `POST /api/vehicles` - Tambah (admin)
- `PATCH /api/vehicles/:id` - Update
- `DELETE /api/vehicles/:id` - Hapus

### Activities
- `GET /api/activities` - List kegiatan
- `POST /api/activities` - Tambah (admin/petugas)
- `PATCH /api/activities/:id` - Update
- `DELETE /api/activities/:id` - Hapus

### Info Board (Papan Informasi)
- `GET /api/info-board` - List jadwal (admin)
- `POST /api/info-board` - Tambah jadwal (admin)
- `PATCH /api/info-board/:id` - Update jadwal (admin)
- `DELETE /api/info-board/:id` - Hapus jadwal (admin)

---

## Brand Colors

- **Brand Primary**: `bg-brand-600` / `text-brand-600` (oranye utama)
- **Brand Light**: `bg-brand-50` / `border-brand-100` (oranye muda)
- **Brand Dark**: `bg-brand-700` (oranye gelap)

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `Cannot find module 'bcrypt'` | `cd backend && npm install` |
| Port 5173 sudah dipakai | Ganti port di `vite.config.js` |
| `Access denied for user` | Cek `.env` → pastikan `DB_PASSWORD` benar |
| Login gagal | Pastikan sudah import `seed.sql` yang baru |

---

## Roadmap

- [x] Landing page dengan hero section & gambar
- [x] Landing page: section Tentang Kami, Statistik, Dokumentasi, Kontak
- [x] Halaman Tentang Kami (`/tentang`) — profil, visi misi, nilai BPBD
- [x] Statistik publik dengan bar chart interaktif + breakdown per bulan
- [x] Admin dashboard dengan charts
- [x] Laporan bencana publik (map picker + max 5 foto + koordinat opsional)
- [x] Tracking status dengan peta + galeri foto
- [x] Peta sebaran publik tanpa login
- [x] Role-based authorization (admin/petugas)
- [x] Pendataan bencana + export PDF
- [x] Admin sidebar dark mode dengan orange active indicator
- [x] Animasi konsisten (page transitions, skeleton, micro-interactions)
- [x] WhatsApp float button
- [x] Manajemen akun admin/petugas + histori login
- [x] Papan informasi jadwal internal (CRUD + fullscreen display)
- [x] Kegiatan dengan field waktu + fitur edit
- [ ] Google OAuth login
- [ ] Socket.IO live updates
- [ ] Mobile app (React Native)

---

## Emergency Contact

**BPBD Kota Semarang**
- Call Center: **112**
- WhatsApp: 0812-3456-7890
- Alamat: Kompleks Terminal Penggaron, Jl. Brigjen Sudiarto No.KM. 11, Penggaron Kidul, Pedurungan, Semarang 50194

---

## License

ISC License

## Author

**Ilman Nafidia** - BPBD Monitoring System Project
