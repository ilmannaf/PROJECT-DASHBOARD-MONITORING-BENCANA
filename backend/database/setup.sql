-- ============================================================
-- SETUP LENGKAP: Sistem Kebencanaan BPBD Kota Semarang
-- Jalankan file ini SATU KALI untuk setup database dari awal
-- Cara: mysql -u root -p < setup.sql
--       atau copy-paste ke MySQL Workbench / HeidiSQL / DBeaver
-- ============================================================

-- Buat dan gunakan database
CREATE DATABASE IF NOT EXISTS sistem_kebencanaan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistem_kebencanaan;

-- Hapus tabel lama jika ada (urutan penting karena foreign key)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS surveys;
DROP TABLE IF EXISTS infrastruktur_proposals;
DROP TABLE IF EXISTS bansos_proposals;
DROP TABLE IF EXISTS air_bersih_proposals;
DROP TABLE IF EXISTS water_supply_settings;
DROP TABLE IF EXISTS water_distributions;
DROP TABLE IF EXISTS btt_penerima;
DROP TABLE IF EXISTS katana_locations;
DROP TABLE IF EXISTS smab_locations;
DROP TABLE IF EXISTS login_history;
DROP TABLE IF EXISTS disaster_records;
DROP TABLE IF EXISTS info_board;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS report_photos;
DROP TABLE IF EXISTS report_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS inventory_items;
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
  role ENUM('admin', 'petugas', 'pelapor') NOT NULL DEFAULT 'petugas',
  wilayah VARCHAR(100),
  bio TEXT,
  status ENUM('on_duty', 'off_duty', 'resting') DEFAULT 'on_duty',
  photo_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel POSKO
CREATE TABLE posko (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255)
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

-- Tabel ACTIVITIES (laporan kegiatan)
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  activity_time TIME DEFAULT NULL,
  location VARCHAR(150),
  documentation_url VARCHAR(255),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel INFO_BOARD (Papan Informasi)
CREATE TABLE info_board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  info_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME DEFAULT NULL,
  location VARCHAR(200),
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
  photos JSON,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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

-- Tabel LOGIN_HISTORY (histori login admin)
CREATE TABLE login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  device_info VARCHAR(255),
  success TINYINT(1) DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel WATER_DISTRIBUTIONS (Pendistribusian Air Bersih)
CREATE TABLE water_distributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  distribution_date DATE NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  location_address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(11, 6),
  amount_liters INT NOT NULL DEFAULT 0,
  tank_truck_count INT NOT NULL DEFAULT 1,
  documentation_photo VARCHAR(255),
  total_supply INT NOT NULL DEFAULT 0,
  notes TEXT,
  status ENUM('selesai', 'dalam_proses', 'dibatalkan') DEFAULT 'selesai',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel WATER SUPPLY SETTINGS
CREATE TABLE water_supply_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_supply INT NOT NULL DEFAULT 0,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel SMAB (Satuan Pendidikan Aman Bencana)
CREATE TABLE smab_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_sekolah VARCHAR(200) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  ancaman_bencana VARCHAR(255),
  tahun_pembentukan YEAR,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel KATANA (FPRB Kelurahan)
CREATE TABLE katana_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kelurahan VARCHAR(150) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  pembentukan VARCHAR(30),
  ancaman_bencana VARCHAR(255),
  sumber_dana VARCHAR(150),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel BANTUAN LANGSUNG TUNAI (BLT / BTT)
CREATE TABLE btt_penerima (
  id INT AUTO_INCREMENT PRIMARY KEY,
  btt_id INT NOT NULL DEFAULT 1,
  nama_penerima VARCHAR(150) NOT NULL,
  no_kk VARCHAR(30),
  nik VARCHAR(30),
  jenis_bencana VARCHAR(150) NOT NULL,
  tanggal_kejadian DATE NOT NULL,
  alamat TEXT NOT NULL,
  kategori_kerusakan TEXT,
  kerusakan TEXT,
  status_pendanaan ENUM('belum_cair', 'cair', 'tidak_cair') NOT NULL DEFAULT 'belum_cair',
  tanggal_pencairan DATE,
  persentase_kerusakan DECIMAL(5,2) DEFAULT 100,
  kelurahan VARCHAR(100),
  kecamatan VARCHAR(100),
  besaran_bantuan DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- TABEL BIDANG 3: DISTRIBUSI BANTUAN
-- ============================================================

-- Tabel USULAN AIR BERSIH
CREATE TABLE air_bersih_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_record_id INT NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  usulan_description TEXT,
  status ENUM('pending', 'diproses', 'selesai') DEFAULT 'pending',
  bukti_dukung_url VARCHAR(500),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel USULAN BANSOS
CREATE TABLE bansos_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_record_id INT NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  nama_penerima VARCHAR(150),
  nik_penerima VARCHAR(20),
  alamat_penerima TEXT,
  phone_penerima VARCHAR(20),
  usulan_description TEXT,
  surat_pengajuan_url VARCHAR(500),
  bukti_dukung_url VARCHAR(500),
  status ENUM('pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'proses_pencairan', 'selesai') DEFAULT 'pending',
  admin_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel USULAN INFRASTRUKTUR
CREATE TABLE infrastruktur_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_record_id INT NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  usulan_description TEXT,
  status ENUM('pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'dalam_pengerjaan', 'selesai') DEFAULT 'pending',
  aset_milik_opd_lain BOOLEAN DEFAULT FALSE,
  opd_nama VARCHAR(150),
  bukti_dukung_url VARCHAR(500),
  admin_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel SURVEY (untuk Bansos & Infrastruktur)
CREATE TABLE surveys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_type ENUM('bansos', 'infrastruktur') NOT NULL,
  proposal_id INT NOT NULL,
  personil_id INT,
  surat_tugas_url VARCHAR(500),
  form_survey_url VARCHAR(500),
  survey_date DATE,
  hasil_survey ENUM('lolos', 'tidak_lolos') DEFAULT NULL,
  keterangan TEXT,
  foto_dokumentasi_url VARCHAR(500),
  status ENUM('dijadwalkan', 'sedang_survey', 'selesai') DEFAULT 'dijadwalkan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (personil_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel STATUS HISTORY (Status Berjenjang)
CREATE TABLE status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_type ENUM('bansos', 'infrastruktur', 'air_bersih', 'water_distribution') NOT NULL,
  proposal_id INT NOT NULL,
  status_from VARCHAR(50),
  status_to VARCHAR(50) NOT NULL,
  note TEXT,
  bukti_dukung_url VARCHAR(500),
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- 1. USERS (password semua: admin123)
INSERT INTO users (name, email, password, role, wilayah, bio, status) VALUES
('Admin BPBD', 'admin@ilmannafia.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'admin', 'Semarang', 'Administrator Sistem BPBD Kota Semarang', 'on_duty'),
('Petugas BPBD', 'petugas@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang', 'Petugas Lapangan BPBD Kota Semarang', 'on_duty'),
('Ahmad Rizki', 'ahmad@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Selatan', 'Koordinator Bidang Penanggulangan Bencana', 'on_duty'),
('Dewi Lestari', 'dewi@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Utara', 'Staf Informasi dan Komunikasi', 'on_duty'),
('Budi Santoso', 'budi@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Timur', 'Tim Reaksi Cepat BPBD', 'on_duty'),
('Siti Rahayu', 'siti@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Barat', 'Koordinator Logistik', 'on_duty');

-- 2. POSKO
INSERT INTO posko (name, address) VALUES
('Posko Utama BPBD Semarang', 'Jl. Pemuda No. 1, Semarang'),
('Posko Semarang Utara', 'Jl. Kaligawe, Semarang Utara'),
('Posko Semarang Selatan', 'Jl. Sisingamangaraja, Semarang Selatan'),
('Posko Semarang Timur', 'Jl. Pandanaran No. 25, Semarang Timur'),
('Posko Semarang Barat', 'Jl. Majapahit, Semarang Barat');

-- 3. REPORTS (Laporan Bencana dari Masyarakat)
INSERT INTO reports (tracking_code, reporter_user_id, reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address, status, assigned_to) VALUES
('BPBD-2026-0001', NULL, 'Pelapor Demo', '081234567890', 'Banjir', 'Air masuk ke pemukiman sekitar 50cm di Kaligawe', -6.9932, 110.4203, 'Kaligawe, Semarang Utara', 'baru', NULL),
('BPBD-2026-0002', NULL, 'Siti Aminah', '082345678901', 'Longsor', 'Tanah longsor menutup akses jalan di Gunungpati', -7.0512, 110.4381, 'Gunungpati, Semarang', 'diverifikasi', 2),
('BPBD-2026-0003', NULL, 'Joko Widodo', '085612345678', 'Kebakaran', 'Kebakaran rumah tinggal di gang sempit', -7.0012, 110.4450, 'Jl. Mawar No. 10, Semarang Timur', 'ditindaklanjuti', 3),
('BPBD-2026-0004', NULL, 'Rina Marlina', '087812345678', 'Banjir', 'Banjir bandang merendam 20 rumah di Pedurungan', -6.9800, 110.4500, 'Pedurungan, Semarang Timur', 'baru', NULL),
('BPBD-2026-0005', NULL, 'Agus Setiawan', '081112223333', 'Angin Puting Beliung', 'Angin kencang robohkan pohon dan atap rumah', -7.0100, 110.4300, 'Genuk, Semarang Utara', 'selesai', 2),
('BPBD-2026-0006', NULL, 'Maya Putri', '082223334444', 'Banjir', 'Luapan sungai banjir masuk permukiman warga', -6.9950, 110.4350, 'Karangturi, Semarang Timur', 'diverifikasi', 3),
('BPBD-2026-0007', NULL, 'Hendra Wijaya', '083334445555', 'Longsor', 'Longsor di area perbukitan mengancam rumah warga', -7.0200, 110.4200, 'Mijen, Semarang Barat', 'baru', NULL),
('BPBD-2026-0008', NULL, 'Farah Amelia', '084445556666', 'Kebakaran', 'Kebakaran lahan kosong dekat pemukiman', -7.0050, 110.4420, 'Tembalang, Semarang', 'ditindaklanjuti', 4),
('BPBD-2026-0009', NULL, 'Kusnanto', '085556667777', 'Banjir', 'Banjir merendam perkantoran dan pertokoan di Genuk', -7.0080, 110.4310, 'Genuk, Semarang', 'baru', NULL),
('BPBD-2026-0010', NULL, 'Lestari Handayani', '086667778888', 'Longsor', 'Longsor susulan mengancam 10 rumah di Mijen', -7.0250, 110.4180, 'Mijen, Semarang Barat', 'diverifikasi', 5);

-- 4. REPORT LOGS (Riwayat Status Laporan)
INSERT INTO report_logs (report_id, status_from, status_to, note, updated_by, created_at) VALUES
(1, NULL, 'baru', 'Laporan diterima dari masyarakat', NULL, '2026-09-01 08:00:00'),
(2, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-01 09:00:00'),
(2, 'baru', 'diverifikasi', 'Diverifikasi oleh petugas lapangan', 2, '2026-09-01 10:30:00'),
(3, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-02 14:00:00'),
(3, 'baru', 'diverifikasi', 'Diverifikasi, kejadian valid', 3, '2026-09-02 14:30:00'),
(3, 'diverifikasi', 'ditindaklanjuti', 'Tim dikerahkan ke lokasi', 3, '2026-09-02 15:00:00'),
(5, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-03 11:00:00'),
(5, 'baru', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 11:30:00'),
(5, 'diverifikasi', 'ditindaklanjuti', 'Penanganan dilakukan', 2, '2026-09-03 12:00:00'),
(5, 'ditindaklanjuti', 'selesai', 'Selesai ditangani, jalan sudah bersih', 2, '2026-09-03 16:00:00'),
(6, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-06 07:00:00'),
(6, 'baru', 'diverifikasi', 'Diverifikasi oleh petugas', 3, '2026-09-06 08:00:00'),
(7, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-07 06:30:00'),
(8, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-07 10:00:00'),
(8, 'baru', 'ditindaklanjuti', 'Tim dikerahkan ke lokasi', 4, '2026-09-07 10:30:00'),
(9, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-08 14:00:00'),
(10, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-08 15:00:00'),
(10, 'baru', 'diverifikasi', 'Diverifikasi, longsor terjadi', 5, '2026-09-08 15:30:00');

-- 5. DISASTER RECORDS (Pendataan Bencana)
INSERT INTO disaster_records (disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, kerugian, sumber_info_nama, sumber_info_phone, created_by) VALUES
('2026-09-01', '06:30', 'Jl. Kaligawe No. 100', 'Kaligawe', 'Semarang Utara', 'PT Sumber Makmur', '081234567890', 'Hujan deras sejak dini hari mengakibatkan sungai meluap dan merendam kawasan industri serta pemukiman warga di Kaligawe. Ketinggian air mencapai 1 meter di beberapa titik.', 25, 0, 2, 5, 80, 95, 40, 3, 10, 50, 'Rp 500.000.000 / 30 rumah rusak, 2 pabrik terendam', 'Joko Widodo', '087812345678', 1),
('2026-09-02', '14:00', 'Gunungpati RT 05/RW 03', 'Gunungpati', 'Gunungpati', 'Siti Rahayu', '085612345678', 'Longsor terjadi di area perbukitan akibat hujan intensitas tinggi. Material tanah dan batu menutupi akses jalan utama dan merusak 3 rumah warga.', 8, 1, 3, 4, 35, 40, 20, 2, 5, 25, 'Rp 200.000.000 / 3 rumah rusak berat', 'Ahmad Rizki', '081112223333', 2),
('2026-09-03', '11:00', 'Jl. Pandanaran No. 25', 'Pandean Lamper', 'Semarang Selatan', 'Siti Rahayu', '085612345678', 'Hujan deras mengguyur wilayah Semarang Selatan sejak pagi hari mengakibatkan sungai meluap dan merendam permukiman warga setempat.', 12, 0, 1, 3, 25, 30, 15, 2, 5, 20, 'Rp 15.000.000 / 5 rumah rusak ringan', 'Joko Widodo', '087812345678', 1),
('2026-09-04', '08:00', 'Jl. Raya Penggaron', 'Penggaron Kidul', 'Pedurungan', NULL, NULL, 'Banjir kiriman dari hulu menggenangi kawasan Padangan dan sekitarnya. Sejumlah warga mulai mengungsi ke posko darurat.', 30, 0, 0, 2, 100, 120, 50, 5, 15, 60, 'Rp 75.000.000 / 40 rumah terendam', 'Dewi Lestari', '082223334444', 2),
('2026-09-05', '16:30', 'Jl. Genuk Raya', 'Genuk', 'Genuk', 'Toko Berkah', '083334445555', 'Angin puting beliung dengan kecepatan tinggi merobohkan pohon tumbang dan merusak atap beberapa rumah serta warung di sepanjang jalan.', 0, 0, 1, 6, 15, 20, 10, 1, 3, 12, 'Rp 80.000.000 / 8 rumah rusak, 2 warung roboh', 'Agus Setiawan', '084445556666', 3),
('2026-09-07', '02:00', 'Karangturi RT 02/RW 01', 'Karangturi', 'Semarang Timur', NULL, NULL, 'Luapan sungai banjir masuk permukiman warga akibat sedimentasi dan curah hujan tinggi. Beberapa rumah terendam setinggi pinggang orang dewasa.', 18, 0, 0, 1, 60, 70, 30, 3, 8, 35, 'Rp 40.000.000 / 20 rumah terendam', 'Rina Marlina', '081112223333', 1),
('2026-09-08', '09:00', 'Mijen RT 03/RW 05', 'Mijen', 'Semarang Barat', 'Hendra Wijaya', '083334445555', 'Longsor susulan terjadi di area perbukitan Mijen setelah hujan deras selama 3 hari berturut-turut. 5 rumah rusak berat dan akses jalan terputus.', 5, 0, 2, 3, 30, 25, 12, 2, 4, 18, 'Rp 120.000.000 / 5 rumah rusak berat', 'Hendra Wijaya', '083334445555', 5),
('2026-09-08', '15:00', 'Jl. Raya Genuk No. 45', 'Genuk', 'Genuk', 'Kusnanto', '085556667777', 'Banjir merendam kawasan perkantoran dan pertokoan di Genuk akibat luapan sungai. Ketinggian air mencapai 60cm di beberapa titik.', 10, 0, 0, 1, 45, 50, 20, 2, 6, 28, 'Rp 95.000.000 / 15 toko terendam', 'Kusnanto', '085556667777', 4);

-- 6. ACTIVITIES (Laporan Kegiatan)
INSERT INTO activities (title, description, activity_date, activity_time, location, created_by) VALUES
('Simulasi Evakuasi Banjir', 'Pelatihan simulasi evakuasi bersama warga di Kelurahan Kaligawe. Diikuti 50 relawan dan warga setempat.', '2026-08-05', '08:00', 'Kaligawe, Semarang Utara', 1),
('Patroli Rutin Wilayah Rawan Longsor', 'Pengecekan kondisi tanah di area rawan longsor Gunungpati. Hasil: tanah sudah mulai stabil.', '2026-08-08', '09:00', 'Gunungpati, Semarang', 2),
('Evakuasi Warga Terdampak Banjir Kaligawe', 'Tim BPBD berhasil mengevakuasi 25 KK dari kawasan Kaligawe yang terendam banjir setinggi 1 meter.', '2026-09-01', '08:00', 'Kaligawe, Semarang Utara', 1),
('Distribusi Logistik ke Posko Pengungsi', 'Pendistribusian sembako dan kebutuhan dasar ke 3 posko pengungsi di Semarang Utara.', '2026-09-02', '10:00', 'Posko Semarang Utara', 2),
('Pembersihan Material Longsor', 'Gotong royong bersama warga membersihkan material longsor di jalan Gunungpati.', '2026-09-03', '07:00', 'Gunungpati, Semarang', 3),
('Peninjauan Posko Darurat', 'Peninjauan langsung kondisi posko darurat dan kebutuhan pengungsi di Pedurungan.', '2026-09-04', '14:00', 'Penggaron Kidul, Pedurungan', 1),
('Pemadaman Api Kebakaran Lahan', 'Tim pemadam kebakaran BPBD berhasil memadamkan api kebakaran lahan kosong seluas 500m2.', '2026-09-05', '16:00', 'Tembalang, Semarang', 4),
('Rapat Evaluasi Penanganan Bencana', 'Rapat evaluasi internal membahas efektivitas penanganan banjir dan longsor bulan September.', '2026-09-08', '09:00', 'Ruang Rapat BPBD', 1),
('Evakuasi Warga Terdampak Longsor Mijen', 'Tim TRC mengevakuasi 18 KK dari area longsor Mijen yang terancam longsor susulan.', '2026-09-08', '10:00', 'Mijen, Semarang Barat', 5),
('Pendistribusian Air Bersih ke Posko Pedurungan', 'Pengiriman 4000 liter air bersih ke posko pengungsi banjir Pedurungan yang kehabisan pasokan air.', '2026-09-09', '08:00', 'Penggaron Kidul, Pedurungan', 3),
('Assessment Kerusakan Infrastruktur', 'Tim asesmen meninjau kerusakan jalan dan drainase di 3 lokasi terdampak banjir.', '2026-09-09', '09:00', 'Genuk & Pedurungan, Semarang', 2),
('Koordinasi dengan Dinas PU', 'Rapat koordinasi dengan Dinas PU terkait perbaikan infrastruktur jalan dan drainase pasca banjir.', '2026-09-10', '08:00', 'Ruang Rapat BPBD', 1),
('Patroli Malam Wilayah Rawan Banjir', 'Patroli malam di wilayah rawan banjir Semarang Utara dan Pedurungan pasca hujan deras.', '2026-09-10', '20:00', 'Semarang Utara & Pedurungan', 5),
('Pengecekan Stok Logistik Darurat', 'Pengecekan dan pendataan ulang stok logistik di seluruh posko untuk memastikan kesiapsiagaan.', '2026-09-10', '10:00', 'Gudang Logistik BPBD', 6);

-- 7. INFO BOARD (Papan Informasi)
INSERT INTO info_board (title, info_date, start_time, end_time, location, description, is_active, created_by) VALUES
('Apel Pagi', '2026-09-03', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel BPBD Kota Semarang', 1, 1),
('Rapat Koordinasi Siaga Darurat', '2026-09-03', '08:00', '09:30', 'Ruang Rapat Utama', 'Rapat koordinasi persiapan penanganan cuaca ekstrem minggu ini', 1, 1),
('Patroli Mitigasi Banjir', '2026-09-03', '09:30', '12:00', 'Kecamatan Pedurungan & Tembalang', 'Patroli rutin wilayah rawan banjir pasca hujan deras', 1, 1),
('Briefing Tim Reaksi Cepat', '2026-09-03', '13:00', '13:30', 'Ruang Operasi', 'Briefing persiapan standby TRC malam ini', 1, 1),
('Sosialisasi Mitigasi Bencana', '2026-09-03', '14:00', '16:00', 'Balai Kelurahan Penggaron Kidul', 'Sosialisasi ke warga tentang antisipasi banjir dan tanah longsor', 1, 1),
('Pengecekan Logistik Darurat', '2026-09-03', '16:00', '17:00', 'Gudang Logistik BPBD', 'Pengecekan dan pendataan ulang stok logistik tanggap darurat', 1, 1),
('Apel Pagi', '2026-09-04', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Kunjungan Posko Terdampak', '2026-09-04', '08:00', '11:00', 'Kecamatan Semarang Utara', 'Kunjungan dan pengecekan kondisi posko pengungsi korban banjir', 1, 1),
('Pelatihan SAR Dasar', '2026-09-04', '13:00', '16:00', 'Lapangan BPBD', 'Pelatihan dasar pencarian dan pertolongan bagi relawan baru', 1, 1),
('Apel Pagi', '2026-09-05', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Evaluasi Mingguan', '2026-09-05', '08:00', '10:00', 'Ruang Rapat Utama', 'Evaluasi penanganan bencana minggu ini', 1, 1),
('Distribusi Bantuan', '2026-09-05', '09:00', '12:00', 'Kelurahan Karangturi & Trimulyo', 'Pendistribusian bantuan logistik ke warga terdampak banjir', 1, 1),
('Apel Pagi', '2026-09-06', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Kerja Bakti Pembersihan', '2026-09-06', '08:00', '12:00', 'Jalan Raya Penggaron', 'Kerja bakti pembersihan lumpur pasca banjir', 1, 1),
('Apel Pagi', '2026-09-07', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Rapat Persiapan Minggu Depan', '2026-09-07', '08:00', '10:00', 'Ruang Rapat Utama', 'Perencanaan kegiatan dan penugasan minggu depan', 1, 1),
('Siaga Banjir Semarang Selatan', '2026-09-08', '06:00', '18:00', 'Kelurahan Pandean Lamper', 'Status siaga banjir untuk wilayah Semarang Selatan akibat hujan deras', 1, 1),
('Apel Pagi', '2026-09-08', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Evakuasi Darurat Longsor Mijen', '2026-09-08', '10:00', '15:00', 'Mijen, Semarang Barat', 'Evakuasi warga terdampak longsor susulan di area perbukitan Mijen', 1, 5),
('Apel Pagi', '2026-09-09', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Rapat Koordinasi Pasca Bencana', '2026-09-09', '08:00', '10:00', 'Ruang Rapat Utama', 'Koordinasi penanganan pasca bencana banjir dan longsor', 1, 1),
('Assessment Kerusakan', '2026-09-09', '09:00', '12:00', 'Genuk & Pedurungan', 'Tim asesmen meninjau kerusakan infrastruktur di lokasi terdampak', 1, 2),
('Distribusi Air Bersih', '2026-09-09', '13:00', '16:00', 'Posko Pengungsi Pedurungan', 'Pendistribusian air bersih untuk pengungsi banjir', 1, 3),
('Apel Pagi', '2026-09-10', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Koordinasi Dinas PU', '2026-09-10', '08:00', '10:00', 'Ruang Rapat BPBD', 'Koordinasi perbaikan infrastruktur jalan dan drainase', 1, 1),
('Patroli Malam Siaga Banjir', '2026-09-10', '20:00', '06:00', 'Semarang Utara & Pedurungan', 'Patroli malam wilayah rawan banjir pasca hujan deras', 1, 5),
('Pengecekan Stok Logistik', '2026-09-10', '10:00', '12:00', 'Gudang Logistik BPBD', 'Pengecekan dan pendataan ulang stok logistik', 1, 6);

-- 8. WATER DISTRIBUTIONS (Distribusi Air Bersih)
INSERT INTO water_distributions (distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status, created_by) VALUES
('2026-09-01', 'Kaligawe', 'Semarang Utara', 'Jl. Kaligawe No. 100, depan Pabrik Sumber Makmur', -6.9932, 110.4203, 3000, 0, 'Distribusi air bersih untuk warga terdampak banjir Kaligawe', 'selesai', 1),
('2026-09-02', 'Gunungpati', 'Gunungpati', 'Jl. Raya Gunungpati No. 55', -7.0512, 110.4381, 2000, 0, 'Distribusi air bersih untuk warga terdampak longsor', 'selesai', 2),
('2026-09-03', 'Pandean Lamper', 'Semarang Selatan', 'Jl. Pandanaran No. 25, depan Balai Warga', -6.9970, 110.4400, 2500, 0, 'Distribusi air bersih untuk warga terdampak banjir di RT 03/RW 02', 'selesai', 1),
('2026-09-04', 'Penggaron Kidul', 'Pedurungan', 'Jl. Raya Penggaron, Masjid Al-Ikhlas', -6.9800, 110.4500, 4000, 0, 'Distribusi air bersih untuk pengungsi banjir Pedurungan', 'selesai', 3),
('2026-09-05', 'Genuk', 'Genuk', 'Jl. Genuk Raya No. 30', -7.0100, 110.4300, 1500, 0, 'Distribusi air bersih untuk warga terdampak angin putting beliung', 'selesai', 2),
('2026-09-07', 'Karangturi', 'Semarang Timur', 'Karangturi RT 02/RW 01, depan Balai RW', -6.9950, 110.4350, 3500, 0, 'Distribusi air bersih untuk warga terdampak banjir kiriman', 'selesai', 1),
('2026-09-08', 'Mijen', 'Semarang Barat', 'Jl. Raya Mijen No. 88', -7.0200, 110.4200, 2000, 0, 'Distribusi air bersih untuk warga terdampak longsor', 'dalam_proses', 4),
('2026-09-08', 'Genuk', 'Genuk', 'Jl. Raya Genuk No. 45, depan Kantor Kecamatan', -7.0080, 110.4310, 2500, 0, 'Distribusi air bersih untuk warga terdampak banjir Genuk', 'dalam_proses', 2),
('2026-09-09', 'Penggaron Kidul', 'Pedurungan', 'Posko Pengungsi Pedurungan', -6.9800, 110.4500, 4500, 0, 'Distribusi air bersih lanjutan untuk pengungsi Pedurungan', 'dalam_proses', 3),
('2026-09-09', 'Kaligawe', 'Semarang Utara', 'Jl. Kaligawe RT 04/RW 01', -6.9932, 110.4203, 3000, 0, 'Distribusi air bersih susulan untuk warga Kaligawe', 'selesai', 1);

-- 9. WATER SUPPLY SETTINGS
INSERT INTO water_supply_settings (total_supply, updated_by) VALUES
(50000, 1);

-- 10. INVENTORY ITEMS
INSERT INTO inventory_items (name, category, item_condition, quantity, unit, posko_id) VALUES
('Tenda Pengungsi', 'peralatan', 'baik', 20, 'unit', 1),
('Beras', 'logistik', 'baik', 300, 'karung', 1),
('Selimut', 'logistik', 'baik', 150, 'lembar', 2),
('Obat P3K', 'p3k', 'baik', 60, 'kotak', 1),
('Perahu Karet', 'peralatan', 'baik', 4, 'unit', 3),
('Mie Instan', 'logistik', 'baik', 600, 'kotak', 1),
('Air Mineral', 'logistik', 'baik', 400, 'dus', 2),
('Jas Hujan', 'peralatan', 'baik', 100, 'lembar', 3),
('Tali Tambang', 'peralatan', 'baik', 25, 'roll', 4),
('Kantong Mayat', 'p3k', 'baik', 10, 'buah', 1),
('Dorongan Angkut', 'peralatan', 'baik', 6, 'unit', 2),
('Genset Portable', 'peralatan', 'baik', 3, 'unit', 1),
('Lilin', 'logistik', 'baik', 300, 'batang', 3),
('Sabun Mandi', 'logistik', 'baik', 200, 'buah', 4),
('Handuk', 'logistik', 'baik', 120, 'lembar', 5),
('Tikar Lipat', 'logistik', 'baik', 50, 'lembar', 2),
('Terpal', 'peralatan', 'baik', 30, 'lembar', 3),
('Kursi Lipat', 'peralatan', 'baik', 20, 'unit', 1);

-- 11. VEHICLES
INSERT INTO vehicles (plate_number, type, status, last_service_date, posko_id) VALUES
('H 1234 AB', 'Truk Serbaguna', 'siap', '2026-08-15', 1),
('H 5678 CD', 'Ambulans', 'siap', '2026-09-01', 2),
('H 9012 EF', 'Mobil Rescue', 'siap', '2026-09-05', 3),
('H 1111 GH', 'Truk Tangki Air', 'siap', '2026-09-08', 1),
('H 2222 IJ', 'Pickup Logistik', 'siap', '2026-08-20', 4),
('H 3333 KL', 'Motor Patroli', 'siap', '2026-09-01', 5),
('H 4444 MN', 'Mobil Operasional', 'maintenance', '2026-09-08', 1),
('H 5555 OP', 'Truk Evakuasi', 'siap', '2026-09-10', 3);

-- 12. AIR BERSIH PROPOSALS
INSERT INTO air_bersih_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, status, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Kebutuhan air bersih untuk 50 KK terdampak banjir. Sumber air bersih terputus akibat kerusakan pipa PDAM.', 'selesai', 1),
(3, 'Pandean Lamper', 'Semarang Selatan', 'Kebutuhan air bersih untuk 20 KK terdampak banjir di RT 03/RW 02. Debit air PDAM sangat kecil.', 'selesai', 2),
(4, 'Penggaron Kidul', 'Pedurungan', 'Kebutuhan mendesak air bersih untuk 60 KK pengungsi di posko darurat. Cadangan air sudah menipis.', 'diproses', 3),
(6, 'Karangturi', 'Semarang Timur', 'Kebutuhan air bersih untuk 35 KK terdampak banjir kiriman. Pipa PDAM belum normal.', 'diproses', 1),
(7, 'Mijen', 'Semarang Barat', 'Kebutuhan air bersih untuk 18 KK terdampak longsor. Sumber air terkontaminasi material longsor.', 'pending', 5),
(8, 'Genuk', 'Genuk', 'Kebutuhan air bersih untuk 28 KK terdampak banjir. Pasokan air dari PDAM terganggu.', 'pending', 4);

-- 13. BANSOS PROPOSALS
INSERT INTO bansos_proposals (disaster_record_id, kelurahan, kecamatan, nama_penerima, nik_penerima, alamat_penerima, phone_penerima, usulan_description, status, admin_notes, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Siti Rahayu', '3374015203850002', 'Jl. Kaligawe No. 100, RT 03/RW 02, Kaligawe', '085612345678', 'Bantuan sosial berupa sembako untuk keluarga terdampak banjir yang kehilangan pekerjaan sementara.', 'selesai', 'Bantuan sudah disalurkan ke 50 KK terdampak', 1),
(2, 'Gunungpati', 'Gunungpati', 'Ahmad Hidayat', '3374016005900003', 'Gunungpati RT 05/RW 03, Gunungpati', '081112223333', 'Bantuan biaya pengobatan dan kebutuhan dasar untuk korban luka berat akibat longsor.', 'proses_pencairan', 'Dana sedang dalam proses pencairan', 2),
(3, 'Pandean Lamper', 'Semarang Selatan', 'Rina Marlina', '3374014508850001', 'Jl. Pandanaran No. 25, RT 01/RW 01, Pandean Lamper', '082223334444', 'Bantuan sembako dan kebutuhan bayi untuk keluarga dengan anak balita.', 'lolos_survey', 'Lolos survey, menunggu proses pencairan', 3),
(4, 'Penggaron Kidul', 'Pedurungan', 'Budi Santoso', '3374015512900005', 'Jl. Raya Penggaron No. 12, Penggaron Kidul', '083334445555', 'Bantuan logistik untuk pengungsi banjir di posko darurat. Total 60 KK membutuhkan bantuan.', 'sedang_survey', 'Tim survey sedang melakukan verifikasi lapangan', 1),
(5, 'Genuk', 'Genuk', 'Dewi Lestari', '3374014803950004', 'Jl. Genuk Raya No. 30, Genuk', '084445556666', 'Bantuan perbaikan rumah akibat kerusakan angin puting beliung.', 'selesai', 'Bantuan perbaikan rumah sudah disalurkan', 2),
(6, 'Karangturi', 'Semarang Timur', 'Maya Putri', '3374014207950006', 'Karangturi RT 02/RW 01, Karangturi', '082223334444', 'Bantuan sembako untuk 35 KK terdampak banjir kiriman di Karangturi.', 'survey_dijadwalkan', 'Survey dijadwalkan pada 11 September 2026', 3),
(7, 'Mijen', 'Semarang Barat', 'Hendra Wijaya', '3374015812900007', 'Mijen RT 03/RW 05, Mijen', '083334445555', 'Bantuan darurat untuk 18 KK terdampak longsor Mijen yang kehilangan tempat tinggal.', 'diverifikasi', 'Diverifikasi, prioritas tinggi', 5),
(8, 'Genuk', 'Genuk', 'Kusnanto', '3374015503850008', 'Jl. Raya Genuk No. 45, Genuk', '085556667777', 'Bantuan kerugian usaha akibat banjir yang merendam toko dan perkantoran.', 'pending', NULL, 4);

-- 14. INFRASTRUKTUR PROPOSALS
INSERT INTO infrastruktur_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, status, aset_milik_opd_lain, opd_nama, admin_notes, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Perbaikan jalan lingkungan RT 03/RW 02 yang rusak akibat banjir. Jalan sepanjang 500 meter perlu diperbaiki.', 'dalam_pengerjaan', 0, NULL, 'Pengerjaan sudah dimulai, target selesai 2 minggu', 1),
(2, 'Gunungpati', 'Gunungpati', 'Rehabilitasi jalan akses utama yang tertutup material longsor. Diperlukan alat berat untuk pembersihan.', 'selesai', 0, NULL, 'Pekerjaan sudah selesai, jalan bisa dilalui', 2),
(4, 'Penggaron Kidul', 'Pedurungan', 'Perbaikan saluran drainase yang tersumbat akibat sedimentasi banjir. Panjang saluran 300 meter.', 'sedang_survey', 1, 'Dinas PU', 'Tim survey dari Dinas PU sudah turun ke lapangan', 3),
(6, 'Karangturi', 'Semarang Timur', 'Pemasangan bronjong di bantaran sungai untuk mencegah banjir susulan. Panjang 200 meter.', 'survey_dijadwalkan', 0, NULL, NULL, 1),
(7, 'Mijen', 'Semarang Barat', 'Perbaikan jalan akses Mijen yang terputus akibat longsor. Diperlukan pembersihan material dan penanganan tanggul.', 'diverifikasi', 0, NULL, 'Diverifikasi, menunggu anggaran', 5),
(8, 'Genuk', 'Genuk', 'Perbaikan saluran drainase utama yang tersumbat di kawasan Genuk. Panjang 400 meter, kedalaman 1.5 meter.', 'pending', 1, 'Dinas PU', NULL, 4);

-- 15. SURVEYS (untuk Bansos & Infrastruktur)
INSERT INTO surveys (proposal_type, proposal_id, personil_id, survey_date, hasil_survey, keterangan, status) VALUES
('bansos', 1, 2, '2026-09-03', 'lolos', 'Keluarga terdampak banjir, kehilangan pekerjaan sementara. Layak mendapat bantuan.', 'selesai'),
('bansos', 2, 3, '2026-09-04', 'lolos', 'Korban luka berat membutuhkan biaya pengobatan serius. Layak mendapat bantuan.', 'selesai'),
('bansos', 3, 5, '2026-09-09', 'lolos', 'Keluarga dengan anak balita, rumah terendam banjir. Layak mendapat bantuan.', 'selesai'),
('bansos', 4, 2, '2026-09-10', NULL, 'Tim survey sedang melakukan verifikasi di lokasi pengungsi.', 'sedang_survey'),
('bansos', 5, 3, '2026-09-06', 'lolos', 'Rumah rusak akibat angin puting beliung, atap dan dinding rusak. Layak mendapat bantuan.', 'selesai'),
('infrastruktur', 1, 2, '2026-09-03', 'lolos', 'Jalan lingkungan rusak parah, diperlukan perbaikan segera. Aset milik Pemerintah Kota.', 'selesai'),
('infrastruktur', 2, 3, '2026-09-04', 'lolos', 'Jalan akses utama tertutup material longsor. Diperlukan alat berat untuk pembersihan.', 'selesai'),
('infrastruktur', 3, 5, '2026-09-10', NULL, 'Tim survey Dinas PU sedang melakukan pengukuran di lokasi.', 'sedang_survey'),
('infrastruktur', 5, 2, '2026-09-09', NULL, 'Menunggu jadwal survey dari tim BPBD.', 'dijadwalkan');

-- 16. STATUS HISTORY (Riwayat Status Usulan)
INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, updated_by, created_at) VALUES
-- Air Bersih
('air_bersih', 1, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-01 09:00:00'),
('air_bersih', 1, 'pending', 'diproses', 'Sedang diproses tim', 1, '2026-09-01 10:00:00'),
('air_bersih', 1, 'diproses', 'selesai', 'Air bersih sudah didistribusikan', 1, '2026-09-02 08:00:00'),
('air_bersih', 2, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-03 08:00:00'),
('air_bersih', 2, 'pending', 'diproses', 'Sedang diproses', 2, '2026-09-03 14:00:00'),
('air_bersih', 2, 'diproses', 'selesai', 'Air bersih sudah didistribusikan', 2, '2026-09-04 10:00:00'),
('air_bersih', 3, NULL, 'pending', 'Usulan dibuat', 3, '2026-09-04 09:00:00'),
('air_bersih', 3, 'pending', 'diproses', 'Sedang diproses tim logistik', 3, '2026-09-05 08:00:00'),
('air_bersih', 4, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-07 10:00:00'),
('air_bersih', 4, 'pending', 'diproses', 'Dikoordinasikan dengan PDAM', 1, '2026-09-08 08:00:00'),
('air_bersih', 5, NULL, 'pending', 'Usulan dibuat', 5, '2026-09-08 11:00:00'),
('air_bersih', 6, NULL, 'pending', 'Usulan dibuat', 4, '2026-09-08 16:00:00'),
-- Bansos
('bansos', 1, NULL, 'pending', 'Usulan bansos dibuat', 1, '2026-09-01 11:00:00'),
('bansos', 1, 'pending', 'diverifikasi', 'Diverifikasi oleh admin', 1, '2026-09-02 09:00:00'),
('bansos', 1, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 1, '2026-09-02 10:00:00'),
('bansos', 1, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey turun ke lapangan', 2, '2026-09-03 08:00:00'),
('bansos', 1, 'sedang_survey', 'lolos_survey', 'Lolos survey, layak mendapat bantuan', 2, '2026-09-03 14:00:00'),
('bansos', 1, 'lolos_survey', 'proses_pencairan', 'Dana dalam proses pencairan', 1, '2026-09-04 08:00:00'),
('bansos', 1, 'proses_pencairan', 'selesai', 'Bantuan sudah disalurkan', 1, '2026-09-05 10:00:00'),
('bansos', 2, NULL, 'pending', 'Usulan bansos dibuat', 2, '2026-09-02 10:00:00'),
('bansos', 2, 'pending', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 08:00:00'),
('bansos', 2, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan minggu depan', 2, '2026-09-03 10:00:00'),
('bansos', 2, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey turun ke lokasi', 3, '2026-09-04 08:00:00'),
('bansos', 2, 'sedang_survey', 'lolos_survey', 'Lolos survey', 3, '2026-09-04 14:00:00'),
('bansos', 2, 'lolos_survey', 'proses_pencairan', 'Dana sedang dalam proses pencairan', 1, '2026-09-05 08:00:00'),
('bansos', 3, NULL, 'pending', 'Usulan bansos dibuat', 3, '2026-09-03 09:00:00'),
('bansos', 3, 'pending', 'diverifikasi', 'Diverifikasi', 3, '2026-09-04 08:00:00'),
('bansos', 3, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 3, '2026-09-04 10:00:00'),
('bansos', 3, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey turun ke lapangan', 5, '2026-09-09 08:00:00'),
('bansos', 3, 'sedang_survey', 'lolos_survey', 'Lolos survey, layak mendapat bantuan', 5, '2026-09-09 14:00:00'),
('bansos', 4, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-04 08:00:00'),
('bansos', 4, 'pending', 'diverifikasi', 'Diverifikasi', 1, '2026-09-04 10:00:00'),
('bansos', 4, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 1, '2026-09-05 08:00:00'),
('bansos', 4, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey turun ke lapangan', 2, '2026-09-10 08:00:00'),
('bansos', 5, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-05 09:00:00'),
('bansos', 5, 'pending', 'diverifikasi', 'Diverifikasi', 2, '2026-09-05 10:00:00'),
('bansos', 5, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 2, '2026-09-05 11:00:00'),
('bansos', 5, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey ke lokasi', 3, '2026-09-06 08:00:00'),
('bansos', 5, 'sedang_survey', 'lolos_survey', 'Lolos survey', 3, '2026-09-06 14:00:00'),
('bansos', 5, 'lolos_survey', 'proses_pencairan', 'Dana cair', 1, '2026-09-07 08:00:00'),
('bansos', 5, 'proses_pencairan', 'selesai', 'Bantuan sudah disalurkan', 2, '2026-09-07 16:00:00'),
('bansos', 6, NULL, 'pending', 'Usulan dibuat', 3, '2026-09-07 11:00:00'),
('bansos', 6, 'pending', 'diverifikasi', 'Diverifikasi', 3, '2026-09-08 08:00:00'),
('bansos', 6, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan 11 September', 1, '2026-09-08 10:00:00'),
('bansos', 7, NULL, 'pending', 'Usulan dibuat', 5, '2026-09-08 12:00:00'),
('bansos', 7, 'pending', 'diverifikasi', 'Diverifikasi, prioritas tinggi', 5, '2026-09-08 14:00:00'),
('bansos', 8, NULL, 'pending', 'Usulan dibuat', 4, '2026-09-08 16:00:00'),
-- Infrastruktur
('infrastruktur', 1, NULL, 'pending', 'Usulan infrastruktur dibuat', 1, '2026-09-01 12:00:00'),
('infrastruktur', 1, 'pending', 'diverifikasi', 'Diverifikasi oleh admin', 1, '2026-09-02 08:00:00'),
('infrastruktur', 1, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 1, '2026-09-02 09:00:00'),
('infrastruktur', 1, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey ke lokasi', 2, '2026-09-03 08:00:00'),
('infrastruktur', 1, 'sedang_survey', 'lolos_survey', 'Lolos survey', 2, '2026-09-03 14:00:00'),
('infrastruktur', 1, 'lolos_survey', 'dalam_pengerjaan', 'Pengerjaan dimulai', 1, '2026-09-05 08:00:00'),
('infrastruktur', 2, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-02 11:00:00'),
('infrastruktur', 2, 'pending', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 08:00:00'),
('infrastruktur', 2, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 2, '2026-09-03 10:00:00'),
('infrastruktur', 2, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey ke lokasi', 3, '2026-09-04 08:00:00'),
('infrastruktur', 2, 'sedang_survey', 'lolos_survey', 'Lolos survey', 3, '2026-09-05 14:00:00'),
('infrastruktur', 2, 'lolos_survey', 'dalam_pengerjaan', 'Pengerjaan dimulai', 2, '2026-09-06 08:00:00'),
('infrastruktur', 2, 'dalam_pengerjaan', 'selesai', 'Pekerjaan selesai, jalan bisa dilalui', 2, '2026-09-08 16:00:00'),
('infrastruktur', 3, NULL, 'pending', 'Usulan dibuat', 3, '2026-09-04 09:00:00'),
('infrastruktur', 3, 'pending', 'diverifikasi', 'Diverifikasi, aset milik Dinas PU', 3, '2026-09-05 08:00:00'),
('infrastruktur', 3, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan dengan Dinas PU', 1, '2026-09-05 10:00:00'),
('infrastruktur', 3, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey Dinas PU ke lokasi', 5, '2026-09-10 08:00:00'),
('infrastruktur', 4, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-07 12:00:00'),
('infrastruktur', 4, 'pending', 'diverifikasi', 'Diverifikasi', 1, '2026-09-08 08:00:00'),
('infrastruktur', 4, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 1, '2026-09-08 10:00:00'),
('infrastruktur', 5, NULL, 'pending', 'Usulan dibuat', 5, '2026-09-08 13:00:00'),
('infrastruktur', 5, 'pending', 'diverifikasi', 'Diverifikasi, menunggu anggaran', 5, '2026-09-09 08:00:00'),
('infrastruktur', 6, NULL, 'pending', 'Usulan dibuat', 4, '2026-09-08 17:00:00');

-- ============================================================
-- SELESAI! Berikut akun yang bisa digunakan:
-- Admin   : admin@ilmannafia.go.id       / admin123
-- Petugas : petugas@bpbdsemarang.go.id   / admin123
-- Petugas : ahmad@bpbdsemarang.go.id     / admin123
-- Petugas : dewi@bpbdsemarang.go.id      / admin123
-- Petugas : budi@bpbdsemarang.go.id      / admin123
-- Petugas : siti@bpbdsemarang.go.id      / admin123
-- ============================================================
