-- Tabel lokasi SMAB (Satuan Pendidikan Aman Bencana)
CREATE TABLE IF NOT EXISTS smab_locations (
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

ALTER TABLE katana_locations MODIFY COLUMN pembentukan VARCHAR(30);

-- Tabel penerima bantuan BTT
CREATE TABLE IF NOT EXISTS btt_penerima (
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

-- Tabel lokasi KATANA (FPRB Kelurahan)
CREATE TABLE IF NOT EXISTS katana_locations (
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
