USE sistem_kebencanaan;

-- Memisahkan data korban & jumlah terdampak menjadi field input terpisah,
-- serta menambah no. HP pemilik. Kolom 'korban' tetap diisi otomatis
-- oleh backend sebagai ringkasan teks (agar tampilan lama tetap kompatibel).
ALTER TABLE disaster_records
  ADD COLUMN pemilik_phone VARCHAR(20) NULL AFTER pemilik,
  ADD COLUMN korban_ps INT NULL AFTER korban,
  ADD COLUMN korban_md INT NULL AFTER korban_ps,
  ADD COLUMN korban_lb INT NULL AFTER korban_md,
  ADD COLUMN korban_lr INT NULL AFTER korban_lb,
  ADD COLUMN terdampak_laki INT NULL AFTER korban_lr,
  ADD COLUMN terdampak_perempuan INT NULL AFTER terdampak_laki,
  ADD COLUMN terdampak_anak INT NULL AFTER terdampak_perempuan,
  ADD COLUMN terdampak_diffable INT NULL AFTER terdampak_anak,
  ADD COLUMN terdampak_lansia INT NULL AFTER terdampak_diffable,
  ADD COLUMN terdampak_kk INT NULL AFTER terdampak_lansia;

-- Backfill data korban record lama (id=5) sesuai isi teks 'korban' yang ada
UPDATE disaster_records
SET korban_ps = NULL,
    korban_md = 0,
    korban_lb = 0,
    korban_lr = 0,
    terdampak_laki = NULL,
    terdampak_perempuan = 0,
    terdampak_anak = 0,
    terdampak_diffable = 0,
    terdampak_lansia = 0,
    terdampak_kk = NULL
WHERE id = 5 AND korban_ps IS NULL;