# BPBD Dashboard Monitoring Bencana

Sistem dashboard monitoring kebencanaan untuk BPBD Kota Semarang. Sistem ini memungkinkan pelaporan bencana dari masyarakat publik dan pengelolaan laporan oleh petugas BPBD.

---

## 📁 Struktur Project

```
BPBD-dashboard/
├── backend/          # Node.js/Express REST API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models
│   │   ├── middlewares/  # Auth, upload, etc
│   │   ├── config/       # DB connection
│   │   └── server.js     # Entry point
│   ├── database/
│   │   ├── schema.sql    # Database schema
│   │   └── seed.sql      # Sample data
│   └── package.json
│
├── frontend/         # React + Vite Dashboard
│   ├── src/
│   │   ├── pages/        # Page components
│   │   │   ├── admin/   # Admin pages
│   │   │   └── public/  # Public pages
│   │   ├── services/     # API services
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── App.jsx       # Main app
│   └── package.json
│
└── mobile/           # React Native (planned)
```

---

## 🚀 Fitur

### Backend (Node.js + Express)

- ✅ **Authentication System**
  - Login/Register dengan JWT
  - Role-based access (admin, petugas)
  - Password hashing dengan bcrypt
  
- ✅ **Disaster Reports Management**
  - Submit laporan bencana (publik, tanpa login)
  - Lihat/track status laporan via tracking code
  - Update status laporan (admin/petugas)
  - Real-time notifications via Socket.IO
  
- ✅ **Inventory Management**
  - Logistik, peralatan, P3K
  - Tracking kondisi item
  
- ✅ **Vehicle Fleet**
  - Status kendaraan (siap, maintenance, rusak)
  - Tracking service date
  
- ✅ **Activity Logging**
  - Laporan kegiatan lapangan

### Frontend (React + Vite + Tailwind CSS v4)

- ✅ **Public Dashboard** (NEW)
  - Login/registrasi untuk pelapor
  - List semua laporan personal
  - Filter berdasarkan status
  - Visualisasi statistik (total, baru, diverifikasi, selesai)
  - Timeline update per laporan
  - History pencarian tracking code
  
- ✅ **Public Report Form**
  - Form pelaporan bencana dari masyarakat
  - Upload foto
  - Geolocation (GPS)
  - Tracking code display
  - Success page dengan tombol "Lacak Status Laporan" (brand orange)
  - Tombol "Kirim laporan lain" (secondary grey)
  
- ✅ **Admin Dashboard**
  - Statistik laporan (total, baru, diverifikasi, selesai)
  - Chart distribusi status & jenis bencana
  - Tabel laporan terbaru
  - Tombol "Lacak Status Laporan" (brand orange)
  
- ✅ **Reports Management**
  - Filter berdasarkan status
  - Update status laporan
  
- ✅ **Inventory Management**
  - Tambah/update/hapus item
  - Tracking kondisi (baik, rusak, perlu_maintenance)
  - Link ke posko
  
- ✅ **Vehicle Management**
  - Tambah/update/hapus kendaraan
  - Status (siap, maintenance, rusak)
  - Link ke posko
  
- ✅ **Posko Management**
  - Tambah/daftar posko
  
- ✅ **Activity Management**
  - Laporan kegiatan lapangan
  - Upload dokumentasi foto
  
- ✅ **Login System**
  - Admin & petugas login
  - Brand orange consistent theme

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express 5
- MySQL (mysql2)
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Socket.IO (real-time)
- Multer (file upload)
- Tailwind CSS v4 (via CDN/bundled)

### Frontend
- React 19.2
- Vite 8.2
- Tailwind CSS v4
- React Router DOM 7.18
- Axios (HTTP client)
- Socket.IO Client

---

## 📊 Database Schema

**Tables:**
- `users` - Admin & petugas BPBD
- `reports` - Laporan bencana
- `report_logs` - History status laporan
- `posko` - Lokasi posko
- `inventory_items` - Logistik & peralatan
- `vehicles` - Kendaraan BPBD
- `activities` - Laporan kegiatan

---

## 🚀 Quick Start

### 1. Setup Database

```sql
-- Buat database
CREATE DATABASE sistem_kebencanaan;
USE sistem_kebencanaan;

-- Import schema
SOURCE path/to/schema.sql;

-- Import seed data
SOURCE path/to/seed.sql;
```

### 2. Backend Setup

```bash
cd BPBD-dashboard/backend

# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan konfigurasi database
# DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT

# Install dependencies
npm install

# Run development server
npm run dev
```

Backend jalan di: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd BPBD-dashboard/frontend

# Copy .env.example ke .env
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5000/api

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend jalan di: `http://localhost:5173`

## 🔗 URL Mapping

### Public
- `/` → Redirect ke `/dashboard`
- `/dashboard` - Public dashboard (login required)
- `/lapor` - Form pelaporan bencana
- `/lacak` - Cek status laporan

### Admin
- `/admin/login` - Login admin/petugas
- `/admin/dashboard` - Dashboard admin
- `/admin/reports` - Kelola laporan
- `/admin/inventory` - Manajemen inventaris
- `/admin/vehicles` - Manajemen kendaraan
- `/admin/posko` - Manajemen posko
- `/admin/activities` - Laporan kegiatan

---

## 🎨 Brand Colors

Sistem menggunakan tema warna oranye konsisten untuk branding BPBD:

- **Brand Primary**: `bg-brand-600` / `text-brand-600` (oranye utama)
- **Brand Light**: `bg-brand-50` / `border-brand-100` (oranye muda)
- **Brand Dark**: `bg-brand-700` (oranye gelap)

Contoh penggunaan:
- Tombol aksi utama: `bg-brand-600 hover:bg-brand-700`
- Navbar accent strip: `bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600`
- Icon/logo gradient: `bg-gradient-to-br from-brand-500 to-brand-700`

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login

### Reports
- `POST /api/reports` - Submit laporan baru (publik)
- `GET /api/reports` - List semua laporan (auth required)
- `GET /api/reports/my-reports` - List laporan user yang login (auth required)
- `GET /api/reports/track/:code` - Cek status via tracking code (publik)
- `PATCH /api/reports/:id/status` - Update status laporan (admin/petugas)

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

## 🔐 Default Credentials (Seed Data)

```
Admin:
Email: admin@bpbdsemarang.go.id
Password: admin123

Petugas 1:
Email: petugas1@bpbdsemarang.go.id
Password: admin123

Petugas 2:
Email: petugas2@bpbdsemarang.go.id
Password: admin123
```

---

## 📱 Fitur Publik

### Dashboard Public (Login Required)
1. Akses `/dashboard` atau `/lacak`
2. Login dengan akun yang sudah didaftarkan
3. Lihat semua laporan personal
4. Track status setiap laporan via timeline
5. Search tracking code dengan history

### Lapor Bencana
1. Akses halaman `/lapor` atau klik "Laporkan Bencana"
2. Isi data pelapor, jenis bencana, lokasi
3. Upload foto (opsional)
4. Klik "Kirim Laporan"
5. Simpan tracking code untuk cek status

### Cek Status Laporan
1. Masukkan tracking code (format: `BPBD-2026-XXX`)
2. Lihat status dan history perubahan
3. Gunakan history pencarian untuk kode lama

---

## 🎨 UI Components

### Admin Pages
- `/admin/login` - Login admin/petugas
- `/admin/dashboard` - Dashboard dengan statistik & tombol lacak
- `/admin/reports` - Kelola laporan bencana
- `/admin/inventory` - Manajemen inventaris
- `/admin/vehicles` - Manajemen kendaraan
- `/admin/posko` - Manajemen posko
- `/admin/activities` - Laporan kegiatan

### Public Pages
- `/dashboard` - Dashboard pelapor (login required)
- `/lapor` - Form pelaporan bencana
- `/lacak` - Cek status laporan via tracking code

---

## 📝 Commit History

1. `fb0ac54` - Initial commit
2. `606390a` - files and folders
3. `619ab09` - setup backend struktur, koneksi DB, schema & seed SQL
4. `ff2099f` - nglanjutin backend
5. `6e7a210` - ganti nama folder
6. `0cbb693` - Perbaiki lokasi instalasi Tailwind, tambah .gitignore root, setup ulang frontend
7. `3448af9` - Setup frontend lengkap: install dependencies, buat pages & services
8. `74f11b8` - Rebuild backend node_modules setelah cleanup dependencies

---

## 📚 Development Status

### ✅ Selesai
- Backend API (Express + MySQL)
- Frontend Pages (Login, Dashboard, Reports, ReportForm)
- Authentication System
- Real-time via Socket.IO
- File upload (Multer)
- Database schema & seed data

### 🚧 Dalam Pengembangan
- Mobile app (React Native)
- Inventory management UI
- Vehicle management UI
- Activity management UI
- Deployment configuration

---

## 🤝 Contributing

1. Fork project
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

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
