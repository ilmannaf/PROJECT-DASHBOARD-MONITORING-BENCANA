# 🚀 Setup & Running Guide - BPBD Dashboard Monitoring Bencana

## 📋 Prerequisites

- Node.js 18+ & npm
- MySQL 8.0+
- Git

---

## 🗄️ Database Setup

### 1. Buat Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE sistem_kebencanaan;
USE sistem_kebencanaan;
```

### 2. Import Schema & Seed Data

```bash
# Import schema
mysql -u root -p sistem_kebencanaan < backend/database/schema.sql

# Import seed data (user default dengan password yang sudah di-hash)
mysql -u root -p sistem_kebencanaan < backend/database/seed.sql
```

### 2b. Jika Database Sudah Ada (Migration)

Jika database sudah pernah dibuat sebelumnya, jalankan migration:

```bash
mysql -u root -p sistem_kebencanaan < backend/database/migration_role_pelapor_reporter_user.sql
```

### 3. User Default (Seed Data)

| Email | Password | Role |
|-------|----------|------|
| `admin@bpbdsemarang.go.id` | `admin123` | admin |
| `petugas@bpbdsemarang.go.id` | `admin123` | petugas |
| `pelapor@example.com` | `admin123` | pelapor |

---

## ⚙️ Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
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

### 3. Run Backend

```bash
npm run dev
```

Backend jalan di: `http://localhost:5000`

**Test backend:**
```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","message":"Server backend berjalan"}
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Frontend

```bash
npm run dev
```

Frontend jalan di: `http://localhost:5173`

---

## 🌐 Akses Aplikasi

### Public Pages (Tanpa Login)

| URL | Deskripsi |
|-----|-----------|
| `http://localhost:5173/` | Landing page (hero section dengan gambar) |
| `http://localhost:5173/lapor` | Form laporan bencana publik |
| `http://localhost:5173/lacak` | Lacak status laporan dengan kode tracking |

### Login Public (Pelapor)

| URL | Deskripsi |
|-----|-----------|
| `http://localhost:5173/dashboard` | Login/register untuk pelapor |
|  | Lihat laporan pribadi & tracking |

> **Note**: Fitur login pelapor saat ini dinonaktifkan dari routing untuk mempercepat proses pelaporan bencana. Pelapor dapat mengirim laporan langsung tanpa login di `/lapor`.

### Login Admin/Petugas

| URL | Deskripsi | Credentials |
|-----|-----------|-------------|
| `http://localhost:5173/admin/login` | Login admin/petugas | `admin@bpbdsemarang.go.id` / `admin123` |
| `http://localhost:5173/admin/dashboard` | Dashboard admin (setelah login) | - |
| `http://localhost:5173/admin/reports` | Kelola laporan bencana | - |
| `http://localhost:5173/admin/inventory` | Kelola inventaris logistik | - |
| `http://localhost:5173/admin/vehicles` | Kelola kendaraan | - |
| `http://localhost:5173/admin/posko` | Kelola posko | - |
| `http://localhost:5173/admin/activities` | Kelola kegiatan lapangan | - |

---

## ✅ Test Flow

### 1. Login Admin
1. Buka `http://localhost:5173/admin/login`
2. Login: `admin@bpbdsemarang.go.id` / `admin123`
3. Dashboard admin terbuka

### 2. Laporan Bencana (Public)
1. Buka `http://localhost:5173/lapor`
2. Isi form (nama, jenis bencana, lokasi, foto)
3. Klik GPS untuk ambil koordinat
4. Submit → dapat tracking code `BPBD-2026-XXXX`

### 3. Lacak Status
1. Buka `http://localhost:5173/lacak`
2. Masukkan tracking code
3. Lihat status + peta lokasi (jika ada GPS)

### 4. Login Pelapor
1. Buka `http://localhost:5173/dashboard`
2. Register akun baru
3. Lihat semua laporan pribadi

---

## 🐛 Troubleshooting

### Backend Error: "Cannot find module 'bcrypt'"
```bash
cd backend
npm install
```

### Frontend Error: Port 5173 sudah dipakai
```bash
# Ganti port di vite.config.js
export default defineConfig({
  server: { port: 3000 }
})
```

### Database Error: "Access denied for user"
Cek `.env` → pastikan `DB_PASSWORD` benar

### Login gagal "Email atau password salah"
Pastikan sudah import `seed.sql` yang baru (dengan bcrypt hash)

---

## 📦 Build Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

Hasil build ada di `frontend/dist/`

---

## 🎯 Fitur Utama

✅ Landing page modern dengan hero section & gambar  
✅ Toggle show/hide password di semua form login  
✅ Peta Google Maps di halaman lacak (jika ada GPS)  
✅ Split-screen login admin dengan sidebar gambar  
✅ Public dashboard untuk pelapor (login/register)  
✅ Admin dashboard dengan charts (Recharts)  
✅ Upload foto laporan & dokumentasi kegiatan  
✅ Real-time tracking dengan kode unik  
✅ Role-based access (admin/petugas - tidak bisa registrasi admin via public)  
✅ Error handling & 404 handler di backend  
✅ Manajemen inventaris CRUD lengkap (tambah, edit, hapus, ubah kondisi)  

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Cek log backend: `npm run dev` output
2. Cek browser console (F12)
3. Cek database: `SELECT * FROM users;`

---

**🎉 Project siap dijalankan!**
