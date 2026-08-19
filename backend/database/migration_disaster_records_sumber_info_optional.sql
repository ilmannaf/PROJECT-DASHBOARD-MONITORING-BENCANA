USE sistem_kebencanaan;

-- Sumber info (nama & no HP) menjadi opsional karena ada permintaan privasi:
-- data bisa dicatat tanpa mencantumkan nama & nomor HP sumber informasi.
ALTER TABLE disaster_records
  MODIFY sumber_info_nama VARCHAR(100) NULL,
  MODIFY sumber_info_phone VARCHAR(20) NULL;