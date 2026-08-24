-- Migration: report_photos untuk support max 5 foto + koordinat opsional sudah ada
USE sistem_kebencanaan;

CREATE TABLE IF NOT EXISTS report_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Migrasi data lama photo_url ke report_photos
INSERT INTO report_photos (report_id, photo_url)
SELECT id, photo_url FROM reports WHERE photo_url IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM report_photos rp WHERE rp.report_id = reports.id AND rp.photo_url = reports.photo_url);
