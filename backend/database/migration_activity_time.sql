-- Migration: Tambah kolom activity_time ke tabel activities
-- Menambahkan kolom waktu/ jam kegiatan

ALTER TABLE activities
ADD COLUMN activity_time TIME DEFAULT NULL
AFTER activity_date;
