-- ============================================
-- Migration: Water Distributions Table
-- ============================================

USE sistem_kebencanaan;

CREATE TABLE IF NOT EXISTS water_distributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  disaster_record_id INT NOT NULL,
  kelurahan VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  nama_distribusi VARCHAR(200) NOT NULL,
  lokasi_distribusi VARCHAR(255),
  jumlah_kubikasi DECIMAL(10, 2),
  target_penerima VARCHAR(200),
  keterangan TEXT,
  status ENUM('pending', 'dalam_perjalanan', 'selesai', 'dibatalkan') DEFAULT 'pending',
  bukti_dukung_url VARCHAR(255),
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (disaster_record_id) REFERENCES disaster_records(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert status history trigger
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_water_dist_status_history
AFTER UPDATE ON water_distributions
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, updated_by)
    VALUES ('water_distribution', NEW.id, OLD.status, NEW.status, NEW.created_by);
  END IF;
END //
DELIMITER ;
