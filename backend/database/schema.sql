-- ============================================
-- Schema Database: Sistem Kebencanaan BPBD
-- ============================================

USE sistem_kebencanaan;

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
  activity_time TIME DEFAULT NULL,
  location VARCHAR(150),
  documentation_url VARCHAR(255),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE activities
ADD COLUMN activity_time TIME DEFAULT NULL
AFTER activity_date;

-- Tabel INFO_BOARD (Papan Informasi)
-- Berbeda dari activities, info_board bisa banyak entries per hari dengan jam spesifik
CREATE TABLE info_board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  info_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME DEFAULT NULL,
  location VARCHAR(200),
  description TEXT,
  priority ENUM('tinggi', 'sedang', 'rendah') DEFAULT 'sedang',
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
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
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
  total_supply INT NOT NULL DEFAULT 0,
  notes TEXT,
  status ENUM('selesai', 'dalam_proses', 'dibatalkan') DEFAULT 'selesai',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);