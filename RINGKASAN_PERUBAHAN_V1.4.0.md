# RINGKASAN PERUBAHAN v1.4.0 — Profil Petugas & Admin

**Tanggal**: 4 September 2026
**Status**: Selesai & Ready

---

## Ringkasan

Penambahan fitur profil petugas (edit bio, foto, status aktivitas) dan halaman admin untuk melihat profil semua petugas. Data profil tersimpan di database, bukan lagi di localStorage.

---

## Peningkatan Utama

### 1. Edit Profil Petugas (ProfilePage.jsx)

| Fitur | Detail |
|-------|--------|
| Foto profil | Upload foto JPG/PNG max 2MB, preview sebelum simpan |
| Bio | Textarea max 250 karakter dengan character counter |
| Status aktivitas | 3 pilihan: Sedang Bertugas, Off Duty, Istirahat |
| Animasi | Framer Motion: staggered fade-in, spring animation, toast notifikasi |
| Icon | Semua pakai Lucide React (tanpa emoji) |

### 2. Halaman Profil Petugas untuk Admin (PetugasProfiles.jsx)

| Fitur | Detail |
|-------|--------|
| Grid card | Menampilkan foto, nama, email, wilayah, bio, status tiap petugas |
| Filter status | Filter by: Semua, Sedang Bertugas, Off Duty, Istirahat |
| Search | Cari berdasarkan nama, email, atau wilayah |
| Detail modal | Klik card untuk lihat detail lengkap profil petugas |
| Statistik | Ringkasan jumlah petugas per status di bagian atas |
| Animasi | Framer Motion: card hover, modal transition, loading skeleton |

### 3. Backend API Profil

| Endpoint | Method | Role | Deskripsi |
|----------|--------|------|-----------|
| `/api/profile/me` | GET | Petugas/Admin | Ambil profil sendiri |
| `/api/profile/me` | PUT | Petugas/Admin | Update profil (bio, status, foto) |
| `/api/profile/petugas` | GET | Admin | Ambil semua profil petugas |
| `/api/profile/petugas/:id` | GET | Admin | Ambil profil petugas tertentu |

### 4. Database Schema Update

Kolom baru ditambahkan otomatis ke tabel `users`:

| Kolom | Tipe | Default |
|-------|------|---------|
| `bio` | TEXT | NULL |
| `status` | ENUM('on_duty','off_duty','resting') | 'on_duty' |
| `photo_url` | VARCHAR(255) | NULL |

---

## File yang Berubah

### File yang Dimodifikasi
- `backend/src/config/db.js` — Tambahan kolom `bio`, `status`, `photo_url` ke tabel `users`
- `backend/src/app.js` — Register route `/api/profile`
- `frontend/src/App.jsx` — Tambah route `/admin/profile` dan `/admin/petugas-profiles`
- `frontend/src/layouts/AdminLayout.jsx` — Tambah menu "Profil" dan "Profil Petugas" di sidebar
- `frontend/src/pages/admin/ProfilePage.jsx` — Rewrite pakai backend API (bukan localStorage)

### File Baru
- `backend/src/controllers/profileController.js` — CRUD profil petugas
- `backend/src/routes/profileRoutes.js` — Route endpoint profil
- `frontend/src/services/profileService.js` — Service functions untuk API profil
- `frontend/src/pages/admin/PetugasProfiles.jsx` — Halaman admin lihat profil petugas

---

## Cara Update Database

### Otomatis (Recommended)
Kolom baru ditambahkan otomatis saat server backend dijalankan. Tidak perlu migration manual.

### Manual (Jika Perlu)
```sql
USE sistem_kebencanaan;

-- Tambah kolom bio
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tambah kolom status
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('on_duty','off_duty','resting') DEFAULT 'on_duty';

-- Tambah kolom photo_url
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255);
```

---

## Testing

1. Login sebagai petugas (`petugas@bpbdsemarang.go.id` / `admin123`)
2. Buka menu "Profil" di sidebar
3. Upload foto profil, tulis bio, pilih status aktivitas
4. Klik "Simpan Perubahan" → toast notifikasi muncul
5. Login sebagai admin (`admin@ilmannafia.go.id` / `admin123`)
6. Buka menu "Profil Petugas" di sidebar
7. Lihat grid card semua petugas dengan foto, bio, status
8. Gunakan filter dan search untuk cari petugas tertentu
9. Klik card petugas untuk lihat detail di modal

---

## Catatan Teknis

- Data profil sekarang tersimpan di database (MySQL), bukan localStorage
- Foto profil diupload ke folder `backend/uploads/` dan diakses via URL
- API menggunakan JWT token untuk autentikasi
- Endpoint `/api/profile/petugas` hanya bisa diakses oleh admin
- Endpoint `/api/profile/me` bisa diakses oleh semua user yang login
