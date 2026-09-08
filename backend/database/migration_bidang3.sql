-- Migration: Tabel-tabel untuk Bidang 3 (Distribusi Bantuan)
-- Air Bersih, Bansos, Infrastruktur

-- ========================================
-- 1. TABEL USULAN AIR BERSIH
-- ========================================
CREATE TABLE IF NOT EXISTS air_bersih_proposals (
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

-- ========================================
-- 2. TABEL USULAN BANSOS
-- ========================================
CREATE TABLE IF NOT EXISTS bansos_proposals (
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
  status ENUM('pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'proses_pencairan', 'selesai') DEFAULT 'pending',
  admin_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- 3. TABEL USULAN INFRASTRUKTUR
-- ========================================
CREATE TABLE IF NOT EXISTS infrastruktur_proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_record_id INT NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  usulan_description TEXT,
  status ENUM('pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'dalam_pengerjaan', 'selesai') DEFAULT 'pending',
  aset_milik_opd_lain BOOLEAN DEFAULT FALSE,
  opd_nama VARCHAR(150),
  admin_notes TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- 4. TABEL SURVEY (untuk Bansos & Infrastruktur)
-- ========================================
CREATE TABLE IF NOT EXISTS surveys (
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

-- ========================================
-- 6. TABEL PENDISTRIBUSIAN AIR BERSIH
-- ========================================
CREATE TABLE IF NOT EXISTS water_distributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  distribution_date DATE NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  location_address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(11, 6),
  amount_liters INT NOT NULL DEFAULT 0,
  total_supply INT NOT NULL DEFAULT 0,
  notes TEXT,
  status ENUM('selesai', 'dalam_proses', 'dibatalkan') DEFAULT 'selesai',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- 6. TABEL STATUS TRACKING (Status Berjenjang)
-- ========================================
CREATE TABLE IF NOT EXISTS status_history (
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
