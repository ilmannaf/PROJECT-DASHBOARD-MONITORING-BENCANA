# BPBD Dashboard Monitoring Bencana

Sistem dashboard monitoring kebencanaan untuk BPBD Kota Semarang. Sistem ini memungkinkan pelaporan bencana dari masyarakat publik dan pengelolaan laporan oleh petugas BPBD.

![Landing Page](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop)

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
- **Landing Page Modern** - Hero section dengan gambar dan CTA buttons
- **Laporan Bencana** - Form pelaporan dengan GPS dan upload foto
- **Lacak Status** - Tracking laporan dengan kode unik + peta lokasi
- **Dashboard Pelapor** - Login/register untuk melihat laporan pribadi

### 🔐 Admin/Petugas Features
- **Dashboard Admin** - Statistik dan charts (Recharts)
- **Kelola Laporan** - Update status, filter, assign petugas
- **Inventaris** - Manajemen logistik dan peralatan
- **Kendaraan** - Fleet management dengan status service
- **Posko** - Kelola titik posko pengungsian
- **Kegiatan** - Laporan kegiatan lapangan dengan dokumentasi

### 🔥 Highlight Features
- ✅ Toggle show/hide password di semua form login
- ✅ Split-screen login admin dengan gambar sidebar
- ✅ Google Maps integration di halaman lacak
- ✅ Real-time tracking dengan kode `BPBD-2026-XXXX`
- ✅ Role-based authorization (admin/petugas)
- ✅ Upload foto untuk laporan dan dokumentasi
- ✅ Auto-search tracking code dari URL

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express 5
- MySQL (mysql2)
- JWT Authentication + Bcrypt
- Socket.IO (real-time)
- Multer (file upload)

### Frontend
- React 19.2 + Vite 8.2
- Tailwind CSS v4
- React Router DOM 7.18
- Axios + Socket.IO Client
- Recharts (data visualization)

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

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi
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

## 🔑 Default Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@bpbdsemarang.go.id | admin123 | admin |
| petugas@bpbdsemarang.go.id | admin123 | petugas |
| pelapor@example.com | admin123 | pelapor |

---

## 📊 Database Schema

**8 Tables:**
- `users` - Admin & petugas BPBD
- `reports` - Laporan bencana
- `report_logs` - History status laporan
- `posko` - Lokasi posko
- `inventory_items` - Logistik & peralatan
- `vehicles` - Kendaraan BPBD
- `activities` - Laporan kegiatan

---

## 📸 Screenshots

### Landing Page
Modern hero section dengan gambar ilustrasi dan CTA buttons

### Admin Dashboard
Dashboard dengan statistik cards dan charts (pie + bar)

### Lacak Status
Tracking laporan dengan status timeline dan Google Maps

---

## 🎯 Roadmap

- [x] Landing page dengan hero section
- [x] Admin dashboard dengan charts
- [x] Laporan bencana publik
- [x] Tracking status dengan peta
- [x] Role-based authorization
- [x] Upload foto dan GPS
- [ ] Socket.IO live updates (backend ready)
- [ ] Assignment petugas di UI
- [ ] Mobile app (React Native)

---

## 📞 Emergency Contact

**BPBD Kota Semarang**
- Call Center: **112**
- WhatsApp: 0812-3456-7890

---

## 📄 License

MIT License - Free to use for educational purposes.

---

**Developed with ❤️ for BPBD Kota Semarang**

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
