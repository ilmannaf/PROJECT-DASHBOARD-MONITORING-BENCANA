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
- **Laporan Bencana** - Form pelaporan dengan peta interaktif (klik/drag marker, GPS opsional), koordinat opsional (laporan tetap terkirim tanpa titik), dan upload **max 5 foto** (JPG/PNG/WEBP 5MB). Akses langsung tanpa login publik
- **Lacak Status** - Tracking laporan dengan kode unik `BPBD-2026-XXXX` + peta lokasi & galeri foto
- **Peta Sebaran** - `/peta` publik tanpa login, filter jenis/status, marker warna per bencana

### 🔐 Admin/Petugas Features
- **Admin Sidebar** - Dark sidebar layout (bg-gray-900) dengan **orange active indicator** (border kiri + bg transparan), lucide-react icons, mobile drawer, dan user footer dengan logout
- **Dashboard Admin** - Statistik dan charts (Recharts) dengan AnimatedNumber count-up
- **Kelola Laporan** - Update status, filter, assign petugas, **hapus laporan** (icon 🗑️ dengan konfirmasi), preview foto & koordinat
- **Pendataan Bencana** - Formulir detail kejadian (kronologi, korban, terdampak, kerugian)
- **Download PDF** - Ekspor formulir pendataan bencana sebagai dokumen resmi BPBD
- **Inventaris** - Manajemen logistik dan peralatan (CRUD lengkap: tambah, edit, hapus, ubah kondisi)
- **Kendaraan** - Fleet management dengan status service
- **Posko** - Kelola titik posko pengungsian
- **Kegiatan** - Laporan kegiatan lapangan dengan dokumentasi

### 🔥 Highlight Features
- ✅ Logo resmi BPBD (gambar) menggantikan teks logo di seluruh halaman
- ✅ Landasan hero & login publik pakai foto/logo dari `frontend/public/assets/`
- ✅ Admin sidebar dark mode (bg-gray-900) dengan lucide-react icons & **orange active indicator** (border kiri oranye + bg transparan)
- ✅ Mobile drawer sidebar dengan backdrop + animated slide-in/out
- ✅ Toggle show/hide password + kursor pointer di semua tombol
- ✅ Formulir pendataan bencana dengan field korban/terdampak terpisah
- ✅ Privasi sumber info — nama & no. HP bisa dikosongkan (opsional)
- ✅ Export PDF formulir pendataan (pdfkit)
- ✅ Google Maps + Leaflet integration di halaman lacak & peta sebaran
- ✅ Role-based authorization (admin/petugas/pelapor - fix ENUM pelapor)
- ✅ Upload **max 5 foto** per laporan (report_photos table) + koordinat opsional dengan map picker presisi
- ✅ **WhatsApp Float Button** — tombol chat WhatsApp di pojok kanan bawah dengan popup bubble (seluruh halaman)
- ✅ **Clean UI / Natural Design** — styling lebih minimalis, tidak "AI-looking", ikon halus (strokeWidth 1.5), warna natural
- ✅ Admin sidebar **orange active indicator** — border kiri oranye + background transparan saat menu aktif
- ✅ Animasi UI konsisten di semua halaman (CSS + vanilla JS, lebih subtle & cepat)
  - Landing page: hero entrance, scroll-reveal sections (lebih ringkas)
  - Admin sidebar: orange active indicator, stagger menu entrance
  - Admin dashboard: AnimatedNumber count-up, stat card clean (white bg + border)
  - Login admin: floating blobs + form stagger entrance
  - ReportForm: form section entrance + bounce-in hasil
  - TrackStatus: progress step bounce-in + result bounce
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
- Lucide React (icons)
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
- `/lapor` - Form pelaporan bencana (tanpa login, map picker, max 5 foto)
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
- [x] Admin sidebar dark mode (lucide-react icons + sliding indicator + mobile drawer)
- [x] Consistent animations across all admin pages (stagger entrance, AnimatedNumber, pulse dots)
- [x] Login admin split-screen + loading spinner
- [x] Landing page polish (hero, fitur, CTA, footer) + logo gambar BPBD
- [x] WhatsApp float button (chat popup di pojok kanan bawah)
- [x] Clean UI / Natural design (kurangi gradient berlebihan, ikon strokeWidth 1.5)
- [x] Admin sidebar orange active indicator (border kiri + bg transparan)
- [x] Kelola laporan admin dengan hapus + preview foto/koordinat
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
