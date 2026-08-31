# RINGKASAN PERUBAHAN v1.3.0 — Manajemen Akun & Histori Login

**Tanggal**: 31 Agustus 2026
**Status**: Selesai & Ready

---

## Ringkasan

Penambahan fitur manajemen akun admin/petugas dan histori login admin. Email admin diubah ke `admin@ilmannafia.go.id`. Info login device diganti dari raw user-agent menjadi nama/initials/wilayah yang lebih readable.

---

## Peningkatan Utama

### 1. Email Admin Diubah

- Email admin default: `admin@ilmannafia.go.id`
- Password tetap: `admin123`
- Semua file seed & setup sudah diperbarui

### 2. Manajemen Akun (UsersManagement.jsx)

| Fitur | Detail |
|-------|--------|
| Role selection | Dropdown admin/petugas saat buat akun baru |
| Password confirmation | Field konfirmasi password (wajib sama) |
| Validasi | Password min 6 karakter, konfirmasi harus match |
| Deskripsi | "Buat akun admin atau petugas baru" |

### 3. Histori Login Admin

| Fitur | Detail |
|-------|--------|
| Hanya admin | Login admin tercatat di `login_history`; login petugas tidak dicatat |
| Info readable | Menampilkan nama, inisial, wilayah (contoh: "Admin BPBD (AB) - Semarang") |
| Kolom device_info | Menggantikan `user_agent` yang lama (raw user-agent string) |
| Header | "Informasi" bukan "User Agent" |

### 4. Kolom Database `device_info`

- Tabel `login_history`: kolom `user_agent` di-rename ke `device_info`
- Jalankan migration untuk DB yang sudah ada:

```sql
USE sistem_kebencanaan;
ALTER TABLE login_history CHANGE COLUMN user_agent device_info VARCHAR(255);
```

---

## File yang Berubah

### File yang Dimodifikasi
- `backend/src/controllers/authController.js` — Login history hanya untuk admin, `device_info`, `getLoginIdentifier()`
- `backend/src/controllers/userController.js` — `createUser` terima param `role`
- `backend/database/schema.sql` — Kolom `device_info`
- `backend/database/setup.sql` — Email admin baru, kolom `device_info`
- `backend/database/seed.sql` — Email admin baru, fix syntax error
- `frontend/src/pages/admin/LoginHistory.jsx` — Header "Informasi", deskripsi "Riwayat login admin"
- `frontend/src/pages/admin/UsersManagement.jsx` — Role dropdown + password confirmation
- `README.md` — Update kredensial, tambah fitur
- `SETUP.md` — Update kredensial

### File Baru
- `backend/database/migration_login_history_device_info.sql` — Rename kolom `user_agent` → `device_info`

---

## Cara Update Database

### Fresh Start (DB Baru)
```bash
mysql -u root -p < backend/database/setup.sql
```

### DB Sudah Ada
```bash
# 1. Update email admin
USE sistem_kebencanaan;
UPDATE users SET email = 'admin@ilmannafia.go.id' WHERE role = 'admin';

# 2. Rename kolom login_history
ALTER TABLE login_history CHANGE COLUMN user_agent device_info VARCHAR(255);
```

---

## Akun Default

| Email | Password | Role |
|-------|----------|------|
| admin@ilmannafia.go.id | admin123 | admin |
| petugas@bpbdsemarang.go.id | admin123 | petugas |

---

## Testing

1. Login `admin@ilmannafia.go.id` / `admin123` → berhasil
2. Buka Manajemen Akun → buat akun baru dengan role admin/petugas + konfirmasi password
3. Buka Histori Login → lihat riwayat login admin dengan info readable
