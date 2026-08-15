USE sistem_kebencanaan;

CREATE TABLE disaster_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_date DATE NOT NULL,
  disaster_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  pemilik VARCHAR(150),
  kronologi TEXT NOT NULL,
  korban TEXT,
  kerugian TEXT,
  sumber_info_nama VARCHAR(100) NOT NULL,
  sumber_info_phone VARCHAR(20) NOT NULL,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
