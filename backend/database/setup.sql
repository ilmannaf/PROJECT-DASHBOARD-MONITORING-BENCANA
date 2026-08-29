-- ============================================================
-- SETUP LENGKAP: Sistem Kebencanaan BPBD
-- Jalankan file ini SATU KALI untuk setup database dari awal
-- Cara: mysql -u root -p < setup.sql
--       atau copy-paste ke MySQL Workbench / HeidiSQL / DBeaver
-- ============================================================

-- Buat dan gunakan database
CREATE DATABASE IF NOT EXISTS sistem_kebencanaan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistem_kebencanaan;

-- Hapus tabel lama jika ada (urutan penting karena foreign key)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS report_photos;
DROP TABLE IF EXISTS report_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS disaster_records;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS posko;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SCHEMA
-- ============================================================

-- Tabel USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'petugas') NOT NULL DEFAULT 'petugas',
  wilayah VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel REPORTS (laporan bencana dari publik)
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracking_code VARCHAR(20) NOT NULL UNIQUE,
  reporter_user_id INT,
  reporter_name VARCHAR(100) NOT NULL,
  reporter_phone VARCHAR(20),
  disaster_type VARCHAR(50) NOT NULL,
  description TEXT,
  photo_url VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address VARCHAR(255),
  status ENUM('baru', 'diverifikasi', 'ditindaklanjuti', 'selesai') DEFAULT 'baru',
  assigned_to INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel REPORT_LOGS (histori perubahan status laporan)
CREATE TABLE report_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  status_from VARCHAR(30),
  status_to VARCHAR(30) NOT NULL,
  note TEXT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel REPORT_PHOTOS (foto multiple max 5 per laporan)
CREATE TABLE report_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Tabel POSKO
CREATE TABLE posko (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255)
);

-- Tabel INVENTORY_ITEMS (logistik & peralatan)
CREATE TABLE inventory_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('logistik', 'peralatan', 'p3k') NOT NULL,
  item_condition ENUM('baik', 'rusak', 'perlu_maintenance') DEFAULT 'baik',
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(20),
  posko_id INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posko_id) REFERENCES posko(id) ON DELETE SET NULL
);

-- Tabel VEHICLES (kesiapan kendaraan)
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(50),
  status ENUM('siap', 'maintenance', 'rusak') DEFAULT 'siap',
  last_service_date DATE,
  posko_id INT,
  FOREIGN KEY (posko_id) REFERENCES posko(id) ON DELETE SET NULL
);

-- Tabel ACTIVITIES (laporan kegiatan)
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  location VARCHAR(150),
  documentation_url VARCHAR(255),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel DISASTER_RECORDS (pendataan bencana oleh petugas)
CREATE TABLE disaster_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_date DATE NOT NULL,
  disaster_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  pemilik VARCHAR(150),
  pemilik_phone VARCHAR(20),
  kronologi TEXT NOT NULL,
  korban TEXT,
  korban_ps INT,
  korban_md INT,
  korban_lb INT,
  korban_lr INT,
  terdampak_laki INT,
  terdampak_perempuan INT,
  terdampak_anak INT,
  terdampak_diffable INT,
  terdampak_lansia INT,
  terdampak_kk INT,
  kerugian TEXT,
  sumber_info_nama VARCHAR(100),
  sumber_info_phone VARCHAR(20),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel LOGIN_HISTORY (histori login admin/petugas)
CREATE TABLE login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  success TINYINT(1) DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Akun default (semua password: "admin123")
INSERT INTO users (name, email, password, role, wilayah) VALUES
('Admin BPBD',   'admin@bpbdsemarang.go.id',   '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'admin',   'Semarang'),
('Petugas BPBD', 'petugas@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang');

-- Posko
INSERT INTO posko (name, address) VALUES
('Posko Utama BPBD Semarang', 'Jl. Pemuda No. 1, Semarang'),
('Posko Semarang Utara', 'Jl. Kaligawe, Semarang Utara'),
('Posko Semarang Selatan', 'Jl. Sisingamangaraja, Semarang Selatan');

-- Contoh inventory
INSERT INTO inventory_items (name, category, item_condition, quantity, unit, posko_id) VALUES
('Tenda Pengungsi', 'peralatan', 'baik', 15, 'unit', 1),
('Beras', 'logistik', 'baik', 200, 'karung', 1),
('Selimut', 'logistik', 'baik', 100, 'lembar', 2),
('Obat P3K', 'p3k', 'baik', 50, 'kotak', 1),
('Perahu Karet', 'peralatan', 'perlu_maintenance', 3, 'unit', 3);

-- Contoh kendaraan
INSERT INTO vehicles (plate_number, type, status, last_service_date, posko_id) VALUES
('H 1234 AB', 'Truk Serbaguna', 'siap', '2026-06-15', 1),
('H 5678 CD', 'Ambulans', 'siap', '2026-07-01', 2),
('H 9012 EF', 'Mobil Rescue', 'maintenance', '2026-05-20', 3);

-- Contoh laporan bencana
INSERT INTO reports (tracking_code, reporter_user_id, reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address, status, assigned_to) VALUES
('BPBD-2026-1234', NULL, 'Pelapor Demo', '081234567890', 'Banjir', 'Air masuk ke pemukiman sekitar 50cm', -6.9932, 110.4203, 'Kaligawe, Semarang Utara', 'baru', NULL),
('BPBD-2026-5678', NULL, 'Siti Aminah', '082345678901', 'Longsor', 'Tanah longsor menutup akses jalan', -7.0512, 110.4381, 'Gunungpati, Semarang', 'diverifikasi', 2);

-- Contoh kegiatan
INSERT INTO activities (title, description, activity_date, location, created_by) VALUES
('Simulasi Evakuasi Banjir', 'Pelatihan simulasi evakuasi bersama warga', '2026-08-05', 'Kaligawe, Semarang Utara', 1),
('Patroli Rutin Wilayah Rawan Longsor', 'Pengecekan kondisi tanah di area rawan longsor', '2026-08-08', 'Gunungpati, Semarang', 2);

-- ============================================================
-- SELESAI! Akun yang bisa digunakan:
-- Admin  : admin@bpbdsemarang.go.id  / admin123
-- Petugas: petugas@bpbdsemarang.go.id / admin123
-- ============================================================
