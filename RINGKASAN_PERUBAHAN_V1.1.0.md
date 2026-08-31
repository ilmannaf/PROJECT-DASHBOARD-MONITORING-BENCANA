# RINGKASAN PERUBAHAN BACKEND v1.1.0

**Tanggal**: 16 Agustus 2026  
**Dibuat oleh**: Kiro  
**Status**: Selesai & Ready

---

## 🎯 Apa yang Diubah?

Kami memisahkan role user menjadi **3 jenis**: `admin`, `petugas`, `pelapor`.

Sebelumnya user yang register dari publik langsung jadi `petugas` (bisa akses semua data). Sekarang mereka jadi `pelapor` (akses terbatas), lebih aman.

---

## 📝 7 Perubahan Utama

### 1. **User Publik Register → Role `pelapor`**
- File: `backend/src/controllers/authController.js`
- Sebelum: User baru = `petugas` (akses penuh)
- Sekarang: User baru = `pelapor` (akses terbatas)
- **Artinya**: Orang yang daftar dari form publik tidak bisa lagi akses data admin

### 2. **Database Role Jadi 3 Macam**
- File: `backend/database/schema.sql`
- Tambah role baru: `pelapor`
- Role sekarang: `admin`, `petugas`, `pelapor`
- **Artinya**: Database siap untuk 3 jenis user berbeda

### 3. **Laporan Linked ke User**
- File: `backend/database/schema.sql`
- Tambah kolom: `reporter_user_id` di tabel `reports`
- **Artinya**: Setiap laporan catat siapa yang membuat, tidak hanya nama saja

### 4. **Admin Endpoint Hanya untuk Admin/Petugas**
- File: `backend/src/routes/reportRoutes.js`
- Endpoint `/api/reports` dan `/api/reports/:id/status` sekarang butuh role `admin` atau `petugas`
- **Artinya**: `pelapor` tidak bisa lihat semua laporan atau ubah status

### 5. **"Laporan Saya" Lebih Akurat**
- File: `backend/src/controllers/reportController.js`
- Sebelum: Cari laporan berdasarkan nama (bisa salah)
- Sekarang: Cari berdasarkan user ID (pasti akurat)
- **Artinya**: Tidak ada lagi kekeliruan laporan tercampur antara user berbeda

### 6. **Update Status Laporan Lebih Aman**
- File: `backend/src/controllers/reportController.js`
- Gunakan transaction (update + insert bersamaan, semua atau batal semua)
- Validasi petugas yang di-assign harus benar-benar ada
- **Artinya**: Data laporan tidak bisa rusak atau terputus

### 7. **Middleware Auth Lebih Fleksibel**
- File: `backend/src/middlewares/authMiddleware.js`
- Tambah: `optionalVerifyToken` (token opsional)
- Perbaiki: `requireRole` (cek user ada atau tidak terlebih dahulu)
- **Artinya**: Endpoint publik bisa menerima login atau tidak login

---

## 🗄️ Database Perubahan

### Tabel `users`
- Role sekarang ada 3: `admin`, `petugas`, `pelapor`

### Tabel `reports`
- Tambah kolom: `reporter_user_id` (link ke user yang lapor)

### File Baru Untuk DB Lama
- `backend/database/migration_role_pelapor_reporter_user.sql`
- **Gunakan ini kalau DB sudah dibuat sebelumnya**

### Seed Data (User Default)
| Email | Password | Role |
|-------|----------|------|
| admin@ilmannafia.go.id | admin123 | admin |
| petugas@bpbdsemarang.go.id | admin123 | petugas |
| pelapor@example.com | admin123 | pelapor |

---

## 📚 Dokumentasi Diperbarui

| File | Perubahan |
|------|-----------|
| `README.md` | Update struktur folder, role baru, kredensial |
| `SETUP.md` | Update path, tambah migration section |
| `.env.example` | Punya nilai default |
| `.gitignore` | Tambah `uploads/`, rapikan path |

---

## 🔐 Keamanan Lebih Baik

| Hal | Sebelum | Sekarang |
|-----|---------|---------|
| User publik jadi apa? | `petugas` (berbahaya) | `pelapor` (aman) |
| Bisa akses admin endpoint? | Ya | Tidak |
| Laporan ownership | Berdasarkan nama | Berdasarkan user ID |
| Update laporan reliable? | Tidak (bisa fail) | Ya (atomic) |

---

## ⚡ Yang Perlu Diperhatikan

### Kalau DB Baru
```bash
mysql -u root -p sistem_kebencanaan < backend/database/schema.sql
mysql -u root -p sistem_kebencanaan < backend/database/seed.sql
```

### Kalau DB Sudah Ada
```bash
mysql -u root -p sistem_kebencanaan < backend/database/migration_role_pelapor_reporter_user.sql
```

---

## ✅ Testing Singkat

1. **Register user baru** → cek apakah role-nya `pelapor`
2. **Login pelapor** → tidak bisa akses `/api/reports`
3. **Login petugas** → bisa akses `/api/reports`
4. **Submit laporan publik** → harus berhasil
5. **Lihat laporan saya** → hanya laporan milik saya

---

## 📋 File yang Berubah

- `backend/src/controllers/authController.js` ✏️
- `backend/src/controllers/reportController.js` ✏️
- `backend/src/middlewares/authMiddleware.js` ✏️
- `backend/src/routes/reportRoutes.js` ✏️
- `backend/database/schema.sql` ✏️
- `backend/database/seed.sql` ✏️
- `backend/database/migration_role_pelapor_reporter_user.sql` ✨ (BARU)
- `.gitignore` ✏️
- `README.md` ✏️
- `SETUP.md` ✏️
- `backend/.env.example` ✏️

---

## 🚀 Cara Jalan

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
npm install framer-motion
```

Buka: `http://localhost:5173`

---

## 💬 Tanya Jawab

**Q: User lama apa bisa diakses?**  
A: Ya, tapi di-assign sebagai `petugas`. Kalau ingin jadi `pelapor`, manual update di database.

**Q: Laporan lama di mana?**  
A: Tetap ada, tapi tidak akan muncul di dashboard pribadi sampai di-link ke user ID.

**Q: Gimana kalau assignment laporan error?**  
A: Cek apakah petugas yang di-assign benar-benar ada di database.

**Q: Perlu restart backend?**  
A: Ya, setelah ubah kode atau config.

---

**Pertanyaan? Chat dengan tim development.**
