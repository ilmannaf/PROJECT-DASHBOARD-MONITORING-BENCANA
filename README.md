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
mysql -u root -p < backend/database/setup.sql
```

> **Catatan:** `setup.sql` berisi schema lengkap + seed data. Untuk setup dari awal, cukup jalankan satu file ini.
> Jika database sudah ada sebelumnya, jalankan migration di `backend/database/` sesuai urutan.

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
| `/admin/bidang3` | Dashboard Bidang 3 - Distribusi Bantuan |
| `/admin/bidang3/air-bersih` | Kelola usulan air bersih |
| `/admin/bidang3/bansos` | Kelola usulan bansos |
| `/admin/bidang3/infrastruktur` | Kelola usulan infrastruktur |
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
- **Bidang 3 — Distribusi Bantuan:**
  - Dashboard ringkasan usulan air bersih, bansos, infrastruktur
  - Usulan Air Bersih — CRUD + status tracking (pending → diproses → selesai)
  - Usulan Bansos — CRUD + validasi data bencana + upload surat pengajuan + status berjenjang
  - Usulan Infrastruktur — CRUD + cek aset OPD lain + status berjenjang
  - Survey lapangan — buat jadwal survey, upload surat tugas & form survey, input hasil survey
  - Status berjenjang — lolos/tidak lolos survey → proses → selesai + bukti dukung
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

## Alur Sistem

### 1. Alur Pelaporan Awal (Intake)

```
MASYARAKAT
    │
    ▼
SISTEM PELAPORAN (WA Bot)
    │
    ▼
LAPORAN BENCANA MASUK
    │
    ▼
ADMIN PUSDALOPS
    │
    ├── Verifikasi & Dispo Unit Lapangan
    │   ├── Input Data Bencana
    │   ├── Foto
    │   ├── Titik Lokasi
    │   └── Verifikasi Logistik (Ya/Tidak)
    │
    ▼
UPDATE DATA BENCANA
    ├── Dashboard
    └── Peta
```

### 2. Assessment & Manajemen Logistik (Bidang 2)

```
ASSESSMENT BIDANG 2
    │
    ▼
Logistik = YA? ──TIDAK──► Selesai
    │
   YA
    │
    ▼
ADMIN LOGISTIK LOGIN
    │
    ▼
CEK STOK LOGISTIK (Sumber/Jumlah)
    │
    ├── CUKUP ──► Input Logistik pada Data Bencana
    │               │
    │               ▼
    │             Laporan Jumlah Kondisi Saat Ini & History Keluar
    │
    └── HABIS ──► Potong Jumlah Logistik
                    │
                    ▼
                  Input Logistik Masuk (Sumber/Jumlah)
                    │
                    ▼
                  Input pada Data Bencana
                    │
                    ▼
                  Laporan Bulanan/Triwulan
```

### 3. Distribusi Bantuan (Bidang 3)

Data diambil dari Assessment Bencana Bidang 2. Dipecah menjadi 3 kategori:

#### 3a. Air Bersih

```
KELURAHAN
    │
    ▼
INPUT USULAN BANTUAN AIR BERSIH
    │
    ▼
USULAN MASUK SISTEM
    │
    ▼
WA BOT KIRIM PESAN KE GRUP BIDANG 3
    │
    ▼
ADMIN BIDANG 3
    │
    ▼
UPLOAD BUKTI DUKUNG DROPPING AIR BERSIH
```

#### 3b. Bansos

```
KELURAHAN / WEBSITE SIRERE
    │
    ▼
INPUT DATA USULAN BANSOS + UPLOAD SURAT PENGAJUAN
    │
    ▼
CEK DATA BENCANA
    │
    ├── TIDAK DITEMUKAN ──► HARUS LAPOR BENCANA DULU (Loop ke Pelaporan)
    │
    └── DITEMUKAN (YA)
            │
            ▼
        USULAN MASUK SISTEM
            │
            ▼
        WA BOT KIRIM PESAN KE GRUP BIDANG 3 & NOMOR PRIBADI PENERIMA
            │
            ▼
        ADMIN BIDANG 3 BUAT SURAT TUGAS
            │
            ▼
        WA BOT KIRIM SURAT TUGAS + LINK FORM SURVEY KE PERSONIL
            │
            ▼
        PERSONIL SURVEY LAPANGAN & ISI FORM SURVEY
            │
            ├── TIDAK LOLOS ──► PROSES TIDAK DILANJUTKAN
            │
            └── LOLOS (YA)
                    │
                    ▼
                SISTEM UPDATE STATUS + NOTIFIKASI KE NOMOR PRIBADI PENERIMA
                    │
                    ▼
                ADMIN BIDANG 3 UPDATE STATUS BERJENJANG
                    │
                    ▼
                STATUS "PENCAIRAN"
                    │
                    ▼
                ADMIN UPLOAD BUKTI DUKUNG
                    │
                    ▼
                STATUS "SELESAI"
```

#### 3c. Infrastruktur

```
KELURAHAN
    │
    ▼
INPUT USULAN BANSOS INFRASTRUKTUR
    │
    ▼
USULAN MASUK SISTEM → WA BOT KIRIM PESAN KE GRUP BIDANG 3
    │
    ▼
ADMIN BIDANG 3 BUAT SURAT TUGAS
    │
    ▼
WA BOT KIRIM SURAT TUGAS + LINK FORM SURVEY KE PERSONIL
    │
    ▼
PERSONIL SURVEY LAPANGAN & ISI FORM SURVEY
    │
    ├── TIDAK ──► CEK ASET MILIK OPD LAIN?
    │               │
    │               ├── YA ──► BOT KIRIM WA PEMBERITAHUAN KE KELURAHAN
    │               │
    │               └── TIDAK ──► TIDAK DILANJUTKAN
    │
    └── YA
            │
            ▼
        SISTEM UPDATE STATUS + KIRIM PEMBERITAHUAN KE KELURAHAN
            │
            ▼
        ADMIN BIDANG 3 UPDATE STATUS BERJENJANG
            │
            ▼
        STATUS "DALAM PENGERJAAN"
            │
            ▼
        SETELAH PENGERJAAN SELESAI
            │
            ▼
        ADMIN UPLOAD BUKTI DUKUNG
            │
            ▼
        STATUS "SELESAI"
```

### Poin Kunci Sistem

- **WA Bot** jadi penggerak notifikasi/komunikasi di banyak titik: distribusi surat tugas, link form survey, notifikasi status ke masyarakat/kelurahan
- **Pemisahan Tanggung Jawab**: Bidang 2 (assessment awal + logistik) vs Bidang 3 (eksekusi bantuan: air bersih, bansos, infrastruktur)
- **Status Berjenjang**: Bukan cuma "selesai/belum" — lebih granular per jenis bantuan (verifikasi survey → proses → pencairan/pengerjaan → selesai + bukti dukung)
- **Validasi Silang**: Pengajuan bansos/infrastruktur wajib terhubung ke data laporan bencana yang sudah ada (tidak bisa berdiri sendiri)

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
| `air_bersih_proposals` | Usulan bantuan air bersih dari kelurahan |
| `bansos_proposals` | Usulan bantuan sosial dari kelurahan |
| `infrastruktur_proposals` | Usulan bantuan infrastruktur dari kelurahan |
| `surveys` | Data survey lapangan untuk bansos & infrastruktur |
| `status_history` | Riwayat perubahan status proposal |

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

### Bidang 3 - Distribusi Bantuan

#### Air Bersih
- `GET /api/bidang3/air-bersih` - List usulan air bersih
- `GET /api/bidang3/air-bersih/:id` - Detail usulan air bersih
- `POST /api/bidang3/air-bersih` - Buat usulan air bersih (admin)
- `PATCH /api/bidang3/air-bersih/:id/status` - Update status (admin)
- `DELETE /api/bidang3/air-bersih/:id` - Hapus usulan (admin)

#### Bansos
- `GET /api/bidang3/bansos` - List usulan bansos
- `GET /api/bidang3/bansos/:id` - Detail usulan bansos
- `POST /api/bidang3/bansos` - Buat usulan bansos (admin, multipart: surat_pengajuan)
- `PATCH /api/bidang3/bansos/:id/status` - Update status (admin)
- `DELETE /api/bidang3/bansos/:id` - Hapus usulan (admin)

#### Infrastruktur
- `GET /api/bidang3/infrastruktur` - List usulan infrastruktur
- `GET /api/bidang3/infrastruktur/:id` - Detail usulan infrastruktur
- `POST /api/bidang3/infrastruktur` - Buat usulan infrastruktur (admin)
- `PATCH /api/bidang3/infrastruktur/:id/status` - Update status (admin)
- `DELETE /api/bidang3/infrastruktur/:id` - Hapus usulan (admin)

#### Survey
- `GET /api/bidang3/surveys` - List survey (filter: proposal_type, proposal_id)
- `POST /api/bidang3/surveys` - Buat survey (admin, multipart: surat_tugas, form_survey)
- `PATCH /api/bidang3/surveys/:id` - Update hasil survey (admin, multipart: foto_dokumentasi)

#### Statistik
- `GET /api/bidang3/stats` - Statistik ringkasan Bidang 3

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
| Login gagal | Pastikan sudah import `setup.sql` yang baru |

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
- [x] **Bidang 3 — Distribusi Bantuan:**
  - [x] Dashboard ringkasan usulan air bersih, bansos, infrastruktur
  - [x] Usulan Air Bersih — CRUD + status tracking
  - [x] Usulan Bansos — CRUD + validasi data bencana + upload surat pengajuan
  - [x] Usulan Infrastruktur — CRUD + cek aset OPD lain
  - [x] Survey lapangan — buat jadwal, upload surat tugas & form survey
  - [x] Status berjenjang + riwayat perubahan status
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
