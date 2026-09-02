-- Migration: Buat tabel info_board (Papan Informasi)
-- Berbeda dari activities, info_board bisa banyak entries per hari dengan jam spesifik

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
