
-- Seed Data: Sistem Kebencanaan BPBD
-- Data awal untuk keperluan development & testing


USE sistem_kebencanaan;

-- User default (password: "admin123" sudah di-hash dengan bcrypt)
INSERT INTO users (name, email, password, role, wilayah) VALUES
('Admin BPBD', 'admin@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'admin', 'Semarang'),
('Petugas Lapangan 1', 'petugas1@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Utara'),
('Petugas Lapangan 2', 'petugas2@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Selatan');

-- Posko
INSERT INTO posko (name, address) VALUES
('Posko Utama BPBD Semarang', 'Jl. Pemuda No. 1, Semarang'),
('Posko Semarang Utara', 'Jl. Kaligawe, Semarang Utara'),
('Posko Semarang Selatan', 'Jl. Sisingamangaraja, Semarang Selatan');

-- Contoh inventory items
INSERT INTO inventory_items (name, category, item_condition, quantity, unit, posko_id) VALUES
('Tenda Pengungsi', 'peralatan', 'baik', 15, 'unit', 1),
('Beras', 'logistik', 'baik', 200, 'karung', 1),
('Selimut', 'logistik', 'baik', 100, 'lembar', 2),
('Obat P3K', 'p3k', 'baik', 50, 'kotak', 1),
('Perahu Karet', 'peralatan', 'perlu_maintenance', 3, 'unit', 3);

-- Contoh kendaraan
INSERT INTO vehicles (plate_number, type, status, last_service_date, posko_id) VALUES
('H 1234 AB', 'Truk Serbaguna', 'siap', '2026-06-15', 1),
('H 5678 CD', 'Ambulans', 'siap', '2026-07-01', 2),
('H 9012 EF', 'Mobil Rescue', 'maintenance', '2026-05-20', 3);

-- Contoh laporan bencana (buat testing dashboard)
INSERT INTO reports (tracking_code, reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address, status) VALUES
('BPBD-2026-1234', 'Budi Santoso', '081234567890', 'Banjir', 'Air masuk ke pemukiman sekitar 50cm', -6.9932, 110.4203, 'Kaligawe, Semarang Utara', 'baru'),
('BPBD-2026-5678', 'Siti Aminah', '082345678901', 'Longsor', 'Tanah longsor menutup akses jalan', -7.0512, 110.4381, 'Gunungpati, Semarang', 'diverifikasi');

-- Contoh laporan kegiatan
INSERT INTO activities (title, description, activity_date, location, created_by) VALUES
('Simulasi Evakuasi Banjir', 'Pelatihan simulasi evakuasi bersama warga', '2026-08-05', 'Kaligawe, Semarang Utara', 1),
('Patroli Rutin Wilayah Rawan Longsor', 'Pengecekan kondisi tanah di area rawan longsor', '2026-08-08', 'Gunungpati, Semarang', 2);