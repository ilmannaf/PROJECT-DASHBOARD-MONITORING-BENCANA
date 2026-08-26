# BPBD Dashboard Monitoring Bencana

Sistem dashboard monitoring kebencanaan untuk BPBD Kota Semarang. Sistem ini memungkinkan pelaporan bencana dari masyarakat publik dan pengelolaan laporan oleh petugas/admin BPBD — mulai dari laporan masuk, pendataan bencana, hingga ekspor dokumen PDF resmi.

---

## 📁 Struktur Project

```
PROJECT-DASHBOARD-MONITORING-BENCANA/
├── backend/          # Node.js/Express REST API
├── frontend/         # React + Vite Dashboard
└── mobile/           # React Native (planned)
```

---

## ✨ Fitur Utama

### 🌐 Public Features
- **Landing Page Modern** - Full-bleed hero foto kantor (≈90vh) dengan overlay gradient, navbar transparan, dan judul besar "BPBD KOTA SEMARANG"
- **Login Publik** - Split-screen seperti admin dengan penanda badge "PORTAL PUBLIK" (aksen biru) pembeda dari admin
- **Laporan Bencana** - Form pelaporan dengan peta interaktif (klik/drag marker, GPS opsional), koordinat opsional (laporan tetap terkirim tanpa titik), dan upload **max 5 foto** (JPG/PNG/WEBP 5MB)
- **Lacak Status** - Tracking laporan dengan kode unik `BPBD-2026-XXXX` + peta lokasi & galeri foto
- **Dashboard Pelapor** - Login/register untuk melihat laporan pribadi (ter-link via `reporter_user_id` + fallback `localStorage` tracking codes), auto-refresh 15s, tombol Refresh, badge 📷/📍

### 🔐 Admin/Petugas Features
- **Dashboard Admin** - Statistik dan charts (Recharts)
- **Kelola Laporan** - Update status, filter, assign petugas, **hapus laporan** (icon 🗑️ dengan konfirmasi), preview foto & koordinat
- **Pendataan Bencana** - Formulir detail kejadian (kronologi, korban, terdampak, kerugian)
- **Download PDF** - Ekspor formulir pendataan bencana sebagai dokumen resmi BPBD
- **Inventaris** - Manajemen logistik dan peralatan
- **Kendaraan** - Fleet management dengan status service
- **Posko** - Kelola titik posko pengungsian
- **Kegiatan** - Laporan kegiatan lapangan dengan dokumentasi
- **Peta Sebaran** - `/peta` publik tanpa login, filter jenis/status, marker warna per bencana

### 🔥 Highlight Features
- ✅ Logo resmi BPBD (gambar) menggantikan teks logo di seluruh halaman
- ✅ Landasan hero & login publik pakai foto/logo dari `frontend/public/assets/`
- ✅ Split-screen login admin (form kiri + panel branding kanan)
- ✅ Split-screen login publik dengan penanda "PORTAL PUBLIK" + akses terpisah ke login admin
- ✅ Toggle show/hide password + kursor pointer di semua tombol
- ✅ Tombol "Masuk dengan Google" (UI siap; butuh konfigurasi OAuth backend)
- ✅ Formulir pendataan bencana dengan field korban/terdampak terpisah
- ✅ Privasi sumber info — nama & no. HP bisa dikosongkan (opsional)
- ✅ Export PDF formulir pendataan (pdfkit)
- ✅ Google Maps + Leaflet integration di halaman lacak & peta sebaran
- ✅ Real-time tracking dengan kode `BPBD-2026-XXXX`
- ✅ Role-based authorization (admin/petugas/pelapor - fix ENUM pelapor)
- ✅ Upload **max 5 foto** per laporan (report_photos table) + koordinat opsional dengan map picker presisi
- ✅ Dashboard publik auto-refresh & localStorage fallback untuk laporan anonim
- ✅ Hapus laporan di admin dengan hapus file fisik
- ✅ Animasi UI murni CSS + vanilla JS (tanpa library tambahan)
  - Landing page: hero stagger entrance, kenburns image effect, scroll-reveal sections
  - Admin dashboard: animated counter (countUp) untuk statistik, staggered card/chart entrance
  - Login admin: floating animated blobs + form stagger entrance
  - Login publik: floating animated blobs + form stagger entrance
  - ReportForm: form section entrance + bounce-in hasil + checkmark draw animation
  - TrackStatus: progress step bounce-in + connector line grow + result bounce
  - DisasterMap: stat card stagger entrance
  - Admin sidebar: sliding gradient indicator yang track menu aktif
  - Semua halaman: page fade-in transition + auto scroll-to-top
  - `prefers-reduced-motion` respected untuk accessibility

---

## 🛠️ Tech Stack

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
- Pure CSS + JS animations (tanpa library tambahan)

---

## 🚀 Quick Start

**Lihat panduan lengkap di [SETUP.md](./SETUP.md)**

### 1. Database Setup
```bash
mysql -u root -p
CREATE DATABASE sistem_kebencanaan;
USE sistem_kebencanaan;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

Jika database sudah pernah dibuat sebelumnya, jalankan migration yang ada di `backend/database/` sesuai urutan:
```bash
SOURCE backend/database/migration_role_pelapor_reporter_user.sql;
SOURCE backend/database/migration_disaster_records_sumber_info_optional.sql;
SOURCE backend/database/migration_disaster_records_korban_terdampak.sql;
SOURCE backend/database/migration_report_photos.sql;
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 4. Akses Aplikasi
- **Landing**: http://localhost:5173/
- **Login Admin**: http://localhost:5173/admin/login
- **Login Pelapor**: http://localhost:5173/dashboard
- **Lapor Bencana**: http://localhost:5173/lapor
- **Lacak Status**: http://localhost:5173/lacak

---

## 🔑 Default Credentials (Seed Data)

| Email | Password | Role |
|-------|----------|------|
| admin@bpbdsemarang.go.id | admin123 | admin |
| petugas@bpbdsemarang.go.id | admin123 | petugas |
| pelapor@example.com | admin123 | pelapor |

> Jika password pernah diganti di database, reset dengan query berikut:
> ```sql
> UPDATE users SET password = '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm' WHERE email = 'admin@bpbdsemarang.go.id';
> ```

---

## 🔗 URL Mapping

### Public
- `/` - Landing page
- `/dashboard` - Public dashboard pelapor (login required, auto-refresh + localStorage tracking codes)
- `/lapor` - Form pelaporan bencana (map picker, max 5 foto)
- `/lacak` - Cek status laporan via tracking code
- `/peta` - Peta sebaran bencana publik (tanpa login, filter & marker warna)

### Admin
- `/admin/login` - Login admin/petugas (split-screen)
- `/admin/dashboard` - Dashboard admin
- `/admin/reports` - Kelola laporan
- `/admin/disaster-records` - Pendataan bencana + download PDF
- `/admin/inventory` - Manajemen inventaris
- `/admin/vehicles` - Manajemen kendaraan
- `/admin/posko` - Manajemen posko
- `/admin/activities` - Laporan kegiatan

---

## 🗄️ Database Schema

**9 Tables:**

| Table | Deskripsi |
|-------|-----------|
| `users` | Admin, petugas & pelapor BPBD (ENUM fix pelapor) |
| `reports` | Laporan bencana dari publik (koordinat opsional, photo_url legacy) |
| `report_photos` | Foto multiple max 5 per laporan (FK reports) |
| `report_logs` | History perubahan status laporan |
| `posko` | Lokasi posko pengungsian |
| `inventory_items` | Logistik & peralatan |
| `vehicles` | Kendaraan BPBD |
| `activities` | Laporan kegiatan lapangan |
| `disaster_records` | Pendataan bencana (kronologi, korban, terdampak, kerugian) |

### `disaster_records` — Field Korban & Terdampak
Data korban disimpan dalam field terpisah dan otomatis dirangkum ke kolom teks `korban` untuk kompatibilitas tampilan:

- **Korban**: `korban_ps` (Pengungsi), `korban_md` (Meninggal Dunia), `korban_lb` (Luka Berat), `korban_lr` (Luka Ringan)
- **Terdampak**: `terdampak_laki`, `terdampak_perempuan`, `terdampak_anak`, `terdampak_diffable`, `terdampak_lansia`, `terdampak_kk`
- **Lainnya**: `pemilik`, `pemilik_phone`, `kerugian`, `sumber_info_nama`, `sumber_info_phone` (nama & HP sumber info opsional untuk privasi)

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru (role pelapor)
- `POST /api/auth/login` - Login

### Reports
- `POST /api/reports` - Submit laporan baru (publik, `multipart` max 5 foto `photos`/`photo`, koordinat opsional, `optionalVerifyToken` link `reporter_user_id` jika pelapor login)
- `GET /api/reports/public` - List untuk peta sebaran (publik, tanpa data sensitif, include `photos[]`)
- `GET /api/reports` - List semua laporan (admin/petugas)
- `GET /api/reports/my-reports` - List laporan user yang login (merge `report_photos`, fallback localStorage di frontend)
- `GET /api/reports/track/:code` - Cek status via tracking code (publik, include `photos[]`)
- `PATCH /api/reports/:id/status` - Update status laporan (admin/petugas)
- `DELETE /api/reports/:id` - Hapus laporan + foto (admin/petugas)

### Disaster Records (Pendataan Bencana)
- `GET /api/disaster-records` - List pendataan bencana (auth required)
- `GET /api/disaster-records/:id` - Detail pendataan (auth required)
- `GET /api/disaster-records/:id/pdf` - Download PDF formulir pendataan (auth required)
- `POST /api/disaster-records` - Tambah pendataan bencana (auth required)
- `PUT /api/disaster-records/:id` - Update pendataan (admin)
- `DELETE /api/disaster-records/:id` - Hapus pendataan (admin)

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Tambah inventory (admin)
- `PATCH /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Hapus inventory

### Vehicles
- `GET /api/vehicles` - List kendaraan
- `POST /api/vehicles` - Tambah kendaraan (admin)
- `PATCH /api/vehicles/:id` - Update kendaraan
- `DELETE /api/vehicles/:id` - Hapus kendaraan

### Activities
- `GET /api/activities` - List kegiatan
- `POST /api/activities` - Tambah kegiatan (admin/petugas)
- `PATCH /api/activities/:id` - Update kegiatan
- `DELETE /api/activities/:id` - Hapus kegiatan

---

## 🎨 Brand Colors

Sistem menggunakan tema warna oranye konsisten untuk branding BPBD:

- **Brand Primary**: `bg-brand-600` / `text-brand-600` (oranye utama)
- **Brand Light**: `bg-brand-50` / `border-brand-100` (oranye muda)
- **Brand Dark**: `bg-brand-700` (oranye gelap)
- **Public Accent**: `sky-*` (biru) dipakai sebagai penanda khusus portal publik vs admin

---

## 🎯 Roadmap

- [x] Landing page dengan hero section
- [x] Admin dashboard dengan charts
- [x] Laporan bencana publik (map picker presisi + max 5 foto + koordinat opsional)
- [x] Tracking status dengan peta + galeri foto
- [x] Peta sebaran publik `/peta` tanpa login
- [x] Role-based authorization (fix ENUM pelapor + reporter_user_id)
- [x] Pendataan bencana + export PDF
- [x] Redesign login split-screen (admin & portal publik)
- [x] Landing page polish (hero, fitur, CTA, footer) + logo gambar BPBD
- [x] Kelola laporan admin dengan hapus + preview foto/koordinat
- [x] Dashboard publik dengan auto-refresh & localStorage fallback
- [x] Animasi UI murni CSS + vanilla JS (stagger, bounce, scroll-reveal, page transitions)
- [ ] Google OAuth login (backend)
- [ ] Socket.IO live updates (full real-time)
- [ ] Mobile app (React Native)

---

## 📞 Emergency Contact

**BPBD Kota Semarang**
- Call Center: **112**
- WhatsApp: 0812-3456-7890

---

## 📄 License

ISC License

---

## 👥 Author

**Ilman Nafidia** - BPBD Monitoring System Project

---

## 🙏 Acknowledgments

- BPBD Kota Semarang
- Tech stack providers
- All contributors
