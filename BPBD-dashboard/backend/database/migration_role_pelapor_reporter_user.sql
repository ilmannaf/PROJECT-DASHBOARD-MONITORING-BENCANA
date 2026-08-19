USE sistem_kebencanaan;

ALTER TABLE users
  MODIFY role ENUM('admin', 'petugas', 'pelapor') NOT NULL DEFAULT 'pelapor';

ALTER TABLE reports
  ADD COLUMN reporter_user_id INT NULL AFTER tracking_code,
  ADD CONSTRAINT fk_reports_reporter_user
    FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL;
