-- ============================================================
-- SEED DATA LENGKAP: Sistem Kebencanaan BPBD Kota Semarang
-- Untuk development & testing
-- ============================================================

USE sistem_kebencanaan;

-- ============================================================
-- 1. USERS (password semua: admin123)
-- ============================================================
INSERT INTO users (name, email, password, role, wilayah, bio, status) VALUES
('Admin BPBD', 'admin@ilmannafia.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'admin', 'Semarang', 'Administrator Sistem BPBD Kota Semarang', 'on_duty'),
('Petugas BPBD', 'petugas@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang', 'Petugas Lapangan BPBD Kota Semarang', 'on_duty'),
('Ahmad Rizki', 'ahmad@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Selatan', 'Koordinator Bidang Penanggulangan Bencana', 'on_duty'),
('Dewi Lestari', 'dewi@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Utara', 'Staf Informasi dan Komunikasi', 'on_duty'),
('Budi Santoso', 'budi@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Timur', 'Tim Reaksi Cepat BPBD', 'off_duty'),
('Siti Rahayu', 'siti@bpbdsemarang.go.id', '$2b$10$mpquimwluN21a/LByqXx/euVylhBz/IoKDLXdk5MnnT2dMJbNNOVm', 'petugas', 'Semarang Barat', 'Koordinator Logistik', 'resting');

-- ============================================================
-- 2. POSKO
-- ============================================================
INSERT INTO posko (name, address) VALUES
('Posko Utama BPBD Semarang', 'Jl. Pemuda No. 1, Semarang'),
('Posko Semarang Utara', 'Jl. Kaligawe, Semarang Utara'),
('Posko Semarang Selatan', 'Jl. Sisingamangaraja, Semarang Selatan'),
('Posko Semarang Timur', 'Jl. Pandanaran No. 25, Semarang Timur'),
('Posko Semarang Barat', 'Jl. Majapahit, Semarang Barat');

-- ============================================================
-- 3. REPORTS (Laporan Bencana dari Masyarakat)
-- ============================================================
INSERT INTO reports (tracking_code, reporter_user_id, reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address, status, assigned_to) VALUES
('BPBD-2026-0001', NULL, 'Pelapor Demo', '081234567890', 'Banjir', 'Air masuk ke pemukiman sekitar 50cm di Kaligawe', -6.9932, 110.4203, 'Kaligawe, Semarang Utara', 'baru', NULL),
('BPBD-2026-0002', NULL, 'Siti Aminah', '082345678901', 'Longsor', 'Tanah longsor menutup akses jalan di Gunungpati', -7.0512, 110.4381, 'Gunungpati, Semarang', 'diverifikasi', 2),
('BPBD-2026-0003', NULL, 'Joko Widodo', '085612345678', 'Kebakaran', 'Kebakaran rumah tinggal di gang sempit', -7.0012, 110.4450, 'Jl. Mawar No. 10, Semarang Timur', 'ditindaklanjuti', 3),
('BPBD-2026-0004', NULL, 'Rina Marlina', '087812345678', 'Banjir', 'Banjir bandang merendam 20 rumah di Pedurungan', -6.9800, 110.4500, 'Pedurungan, Semarang Timur', 'baru', NULL),
('BPBD-2026-0005', NULL, 'Agus Setiawan', '081112223333', 'Angin Puting Beliung', 'Angin kencang robohkan pohon dan atap rumah', -7.0100, 110.4300, 'Genuk, Semarang Utara', 'selesai', 2),
('BPBD-2026-0006', NULL, 'Maya Putri', '082223334444', 'Banjir', 'Luapan sungai banjir masuk permukiman warga', -6.9950, 110.4350, 'Karangturi, Semarang Timur', 'diverifikasi', 3),
('BPBD-2026-0007', NULL, 'Hendra Wijaya', '083334445555', 'Longsor', 'Longsor di area perbukitan mengancam rumah warga', -7.0200, 110.4200, 'Mijen, Semarang Barat', 'baru', NULL),
('BPBD-2026-0008', NULL, 'Farah Amelia', '084445556666', 'Kebakaran', 'Kebakaran lahan kosong dekat pemukiman', -7.0050, 110.4420, 'Tembalang, Semarang', 'ditindaklanjuti', 4);

-- ============================================================
-- 4. REPORT LOGS (Riwayat Status Laporan)
-- ============================================================
INSERT INTO report_logs (report_id, status_from, status_to, note, updated_by, created_at) VALUES
(1, NULL, 'baru', 'Laporan diterima dari masyarakat', NULL, '2026-09-01 08:00:00'),
(2, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-01 09:00:00'),
(2, 'baru', 'diverifikasi', 'Diverifikasi oleh petugas lapangan', 2, '2026-09-01 10:30:00'),
(3, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-02 14:00:00'),
(3, 'baru', 'diverifikasi', 'Diverifikasi, kejadian valid', 3, '2026-09-02 14:30:00'),
(3, 'diverifikasi', 'ditindaklanjuti', 'Tim dikerahkan ke lokasi', 3, '2026-09-02 15:00:00'),
(5, NULL, 'baru', 'Laporan diterima', NULL, '2026-09-03 11:00:00'),
(5, 'baru', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 11:30:00'),
(5, 'diverifikasi', 'ditindaklanjuti', 'Penanganan dilakukan', 2, '2026-09-03 12:00:00'),
(5, 'ditindaklanjuti', 'selesai', 'Selesai ditangani, jalan sudah bersih', 2, '2026-09-03 16:00:00');

-- ============================================================
-- 5. DISASTER RECORDS (Pendataan Bencana)
-- ============================================================
INSERT INTO disaster_records (disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, kerugian, sumber_info_nama, sumber_info_phone, created_by) VALUES
('2026-09-01', '06:30', 'Jl. Kaligawe No. 100', 'Kaligawe', 'Semarang Utara', 'PT Sumber Makmur', '081234567890', 'Hujan deras sejak dini hari mengakibatkan sungai meluap dan merendam kawasan industri serta pemukiman warga di Kaligawe. Ketinggian air mencapai 1 meter di beberapa titik.', 25, 0, 2, 5, 80, 95, 40, 3, 10, 50, 'Rp 500.000.000 / 30 rumah rusak, 2 pabrik terendam', 'Joko Widodo', '087812345678', 1),
('2026-09-02', '14:00', 'Gunungpati RT 05/RW 03', 'Gunungpati', 'Gunungpati', 'Siti Rahayu', '085612345678', 'Longsor terjadi di area perbukitan akibat hujan intensitas tinggi. Material tanah dan batu menutupi akses jalan utama dan merusak 3 rumah warga.', 8, 1, 3, 4, 35, 40, 20, 2, 5, 25, 'Rp 200.000.000 / 3 rumah rusak berat', 'Ahmad Rizki', '081112223333', 2),
('2026-09-03', '11:00', 'Jl. Pandanaran No. 25', 'Pandean Lamper', 'Semarang Selatan', 'Siti Rahayu', '085612345678', 'Hujan deras mengguyur wilayah Semarang Selatan sejak pagi hari mengakibatkan sungai meluap dan merendam permukiman warga setempat.', 12, 0, 1, 3, 25, 30, 15, 2, 5, 20, 'Rp 15.000.000 / 5 rumah rusak ringan', 'Joko Widodo', '087812345678', 1),
('2026-09-04', '08:00', 'Jl. Raya Penggaron', 'Penggaron Kidul', 'Pedurungan', NULL, NULL, 'Banjir kiriman dari hulu menggenangi kawasan Padangan dan sekitarnya. Sejumlah warga mulai mengungsi ke posko darurat.', 30, 0, 0, 2, 100, 120, 50, 5, 15, 60, 'Rp 75.000.000 / 40 rumah terendam', 'Dewi Lestari', '082223334444', 2),
('2026-09-05', '16:30', 'Jl. Genuk Raya', 'Genuk', 'Genuk', 'Toko Berkah', '083334445555', 'Angin puting beliung dengan kecepatan tinggi merobohkan pohon tumbang dan merusak atap beberapa rumah serta warung di sepanjang jalan.', 0, 0, 1, 6, 15, 20, 10, 1, 3, 12, 'Rp 80.000.000 / 8 rumah rusak, 2 warung roboh', 'Agus Setiawan', '084445556666', 3),
('2026-09-07', '02:00', 'Karangturi RT 02/RW 01', 'Karangturi', 'Semarang Timur', NULL, NULL, 'Luapan sungai banjir masuk permukiman warga akibat sedimentasi dan curah hujan tinggi. Beberapa rumah terendam setinggi pinggang orang dewasa.', 18, 0, 0, 1, 60, 70, 30, 3, 8, 35, 'Rp 40.000.000 / 20 rumah terendam', 'Rina Marlina', '081112223333', 1);

-- ============================================================
-- 6. ACTIVITIES (Laporan Kegiatan)
-- ============================================================
INSERT INTO activities (title, description, activity_date, activity_time, location, created_by) VALUES
('Simulasi Evakuasi Banjir', 'Pelatihan simulasi evakuasi bersama warga di Kelurahan Kaligawe. Diikuti 50 relawan dan warga setempat.', '2026-08-05', '08:00', 'Kaligawe, Semarang Utara', 1),
('Patroli Rutin Wilayah Rawan Longsor', 'Pengecekan kondisi tanah di area rawan longsor Gunungpati. Hasil: tanah sudah mulai stabil.', '2026-08-08', '09:00', 'Gunungpati, Semarang', 2),
('Evakuasi Warga Terdampak Banjir Kaligawe', 'Tim BPBD berhasil mengevakuasi 25 KK dari kawasan Kaligawe yang terendam banjir setinggi 1 meter.', '2026-09-01', '08:00', 'Kaligawe, Semarang Utara', 1),
('Distribusi Logistik ke Posko Pengungsi', 'Pendistribusian sembako dan kebutuhan dasar ke 3 posko pengungsi di Semarang Utara.', '2026-09-02', '10:00', 'Posko Semarang Utara', 2),
('Pembersihan Material Longsor', 'Gotong royong bersama warga membersihkan material longsor di jalan Gunungpati.', '2026-09-03', '07:00', 'Gunungpati, Semarang', 3),
('Peninjauan Posko Darurat', 'Peninjauan langsung kondisi posko darurat dan kebutuhan pengungsi di Pedurungan.', '2026-09-04', '14:00', 'Penggaron Kidul, Pedurungan', 1),
('Pemadaman Api Kebakaran Lahan', 'Tim pemadam kebakaran BPBD berhasil memadamkan api kebakaran lahan kosong seluas 500m2.', '2026-09-05', '16:00', 'Tembalang, Semarang', 4),
('Rapat Evaluasi Penanganan Bencana', 'Rapat evaluasi internal membahas efektivitas penanganan banjir dan longsor bulan September.', '2026-09-08', '09:00', 'Ruang Rapat BPBD', 1);

-- ============================================================
-- 7. INFO BOARD (Papan Informasi)
-- ============================================================
INSERT INTO info_board (title, info_date, start_time, end_time, location, description, is_active, created_by) VALUES
('Apel Pagi', '2026-09-03', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel BPBD Kota Semarang', 1, 1),
('Rapat Koordinasi Siaga Darurat', '2026-09-03', '08:00', '09:30', 'Ruang Rapat Utama', 'Rapat koordinasi persiapan penanganan cuaca ekstrem minggu ini', 1, 1),
('Patroli Mitigasi Banjir', '2026-09-03', '09:30', '12:00', 'Kecamatan Pedurungan & Tembalang', 'Patroli rutin wilayah rawan banjir pasca hujan deras', 1, 1),
('Briefing Tim Reaksi Cepat', '2026-09-03', '13:00', '13:30', 'Ruang Operasi', 'Briefing persiapan standby TRC malam ini', 1, 1),
('Sosialisasi Mitigasi Bencana', '2026-09-03', '14:00', '16:00', 'Balai Kelurahan Penggaron Kidul', 'Sosialisasi ke warga tentang antisipasi banjir dan tanah longsor', 1, 1),
('Pengecekan Logistik Darurat', '2026-09-03', '16:00', '17:00', 'Gudang Logistik BPBD', 'Pengecekan dan pendataan ulang stok logistik tanggap darurat', 1, 1),
('Apel Pagi', '2026-09-04', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Kunjungan Posko Terdampak', '2026-09-04', '08:00', '11:00', 'Kecamatan Semarang Utara', 'Kunjungan dan pengecekan kondisi posko pengungsi korban banjir', 1, 1),
('Pelatihan SAR Dasar', '2026-09-04', '13:00', '16:00', 'Lapangan BPBD', 'Pelatihan dasar pencarian dan pertolongan bagi relawan baru', 1, 1),
('Apel Pagi', '2026-09-05', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Evaluasi Mingguan', '2026-09-05', '08:00', '10:00', 'Ruang Rapat Utama', 'Evaluasi penanganan bencana minggu ini', 1, 1),
('Distribusi Bantuan', '2026-09-05', '09:00', '12:00', 'Kelurahan Karangturi & Trimulyo', 'Pendistribusian bantuan logistik ke warga terdampak banjir', 1, 1),
('Apel Pagi', '2026-09-06', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Kerja Bakti Pembersihan', '2026-09-06', '08:00', '12:00', 'Jalan Raya Penggaron', 'Kerja bakti pembersihan lumpur pasca banjir', 1, 1),
('Apel Pagi', '2026-09-07', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1),
('Rapat Persiapan Minggu Depan', '2026-09-07', '08:00', '10:00', 'Ruang Rapat Utama', 'Perencanaan kegiatan dan penugasan minggu depan', 1, 1),
('Siaga Banjir Semarang Selatan', '2026-09-08', '06:00', '18:00', 'Kelurahan Pandean Lamper', 'Status siaga banjir untuk wilayah Semarang Selatan akibat hujan deras', 1, 1),
('Apel Pagi', '2026-09-08', '07:00', '07:30', 'Halaman Kantor BPBD', 'Apel pagi seluruh personel', 1, 1);

-- ============================================================
-- 8. WATER DISTRIBUTIONS (Distribusi Air Bersih)
-- ============================================================
INSERT INTO water_distributions (distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status, created_by) VALUES
('2026-09-01', 'Kaligawe', 'Semarang Utara', 'Jl. Kaligawe No. 100, depan Pabrik Sumber Makmur', -6.9932, 110.4203, 3000, 0, 'Distribusi air bersih untuk warga terdampak banjir Kaligawe', 'selesai', 1),
('2026-09-02', 'Gunungpati', 'Gunungpati', 'Jl. Raya Gunungpati No. 55', -7.0512, 110.4381, 2000, 0, 'Distribusi air bersih untuk warga terdampak longsor', 'selesai', 2),
('2026-09-03', 'Pandean Lamper', 'Semarang Selatan', 'Jl. Pandanaran No. 25, depan Balai Warga', -6.9970, 110.4400, 2500, 0, 'Distribusi air bersih untuk warga terdampak banjir di RT 03/RW 02', 'selesai', 1),
('2026-09-04', 'Penggaron Kidul', 'Pedurungan', 'Jl. Raya Penggaron, Masjid Al-Ikhlas', -6.9800, 110.4500, 4000, 0, 'Distribusi air bersih untuk pengungsi banjir Pedurungan', 'selesai', 3),
('2026-09-05', 'Genuk', 'Genuk', 'Jl. Genuk Raya No. 30', -7.0100, 110.4300, 1500, 0, 'Distribusi air bersih untuk warga terdampak angin putting beliung', 'selesai', 2),
('2026-09-07', 'Karangturi', 'Semarang Timur', 'Karangturi RT 02/RW 01, depan Balai RW', -6.9950, 110.4350, 3500, 0, 'Distribusi air bersih untuk warga terdampak banjir kiriman', 'dalam_proses', 1),
('2026-09-08', 'Mijen', 'Semarang Barat', 'Jl. Raya Mijen No. 88', -7.0200, 110.4200, 2000, 0, 'Distribusi air bersih untuk warga terdampak longsor', 'dalam_proses', 4);

-- ============================================================
-- 9. WATER SUPPLY SETTINGS
-- ============================================================
INSERT INTO water_supply_settings (total_supply, updated_by) VALUES
(50000, 1);

-- ============================================================
-- 10. INVENTORY ITEMS
-- ============================================================
INSERT INTO inventory_items (name, category, item_condition, quantity, unit, posko_id) VALUES
('Tenda Pengungsi', 'peralatan', 'baik', 15, 'unit', 1),
('Beras', 'logistik', 'baik', 200, 'karung', 1),
('Selimut', 'logistik', 'baik', 100, 'lembar', 2),
('Obat P3K', 'p3k', 'baik', 50, 'kotak', 1),
('Perahu Karet', 'peralatan', 'perlu_maintenance', 3, 'unit', 3),
('Mie Instan', 'logistik', 'baik', 500, 'kotak', 1),
('Air Mineral', 'logistik', 'baik', 300, 'dus', 2),
('Jas Hujan', 'peralatan', 'baik', 80, 'lembar', 3),
('Tali Tambang', 'peralatan', 'baik', 20, 'roll', 4),
('Kantong Mayat', 'p3k', 'baik', 10, 'buah', 1),
('Dorongan Angkut', 'peralatan', 'baik', 5, 'unit', 2),
(' genset Portable', 'peralatan', 'baik', 2, 'unit', 1),
('Lilin', 'logistik', 'baik', 200, 'batang', 3),
('Sabun Mandi', 'logistik', 'baik', 150, 'buah', 4),
('Handuk', 'logistik', 'baik', 100, 'lembar', 5);

-- ============================================================
-- 11. VEHICLES
-- ============================================================
INSERT INTO vehicles (plate_number, type, status, last_service_date, posko_id) VALUES
('H 1234 AB', 'Truk Serbaguna', 'siap', '2026-06-15', 1),
('H 5678 CD', 'Ambulans', 'siap', '2026-07-01', 2),
('H 9012 EF', 'Mobil Rescue', 'maintenance', '2026-05-20', 3),
('H 1111 GH', 'Truk Tangki Air', 'siap', '2026-08-10', 1),
('H 2222 IJ', 'Pickup Logistik', 'siap', '2026-07-20', 4),
('H 3333 KL', 'Motor Patroli', 'siap', '2026-08-01', 5),
('H 4444 MN', 'Mobil Operasional', 'rusak', '2026-04-15', 1),
('H 5555 OP', 'Truk Evakuasi', 'siap', '2026-08-20', 3);

-- ============================================================
-- 12. AIR BERSIH PROPOSALS
-- ============================================================
INSERT INTO air_bersih_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, status, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Kebutuhan air bersih untuk 50 KK terdampak banjir. Sumber air bersih terputus akibat kerusakan pipa PDAM.', 'selesai', 1),
(3, 'Pandean Lamper', 'Semarang Selatan', 'Kebutuhan air bersih untuk 20 KK terdampak banjir di RT 03/RW 02. debit air PDAM sangat kecil.', 'diproses', 2),
(4, 'Penggaron Kidul', 'Pedurungan', 'Kebutuhan mendesak air bersih untuk 60 KK pengungsi di posko darurat. Cadangan air sudah menipis.', 'pending', 3),
(6, 'Karangturi', 'Semarang Timur', 'Kebutuhan air bersih untuk 35 KK terdampak banjir kiriman. Pipa PDAM belum normal.', 'pending', 1);

-- ============================================================
-- 13. BANSOS PROPOSALS
-- ============================================================
INSERT INTO bansos_proposals (disaster_record_id, kelurahan, kecamatan, nama_penerima, nik_penerima, alamat_penerima, phone_penerima, usulan_description, status, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Siti Rahayu', '3374015203850002', 'Jl. Kaligawe No. 100, RT 03/RW 02, Kaligawe', '085612345678', 'Bantuan sosial berupa sembako untuk keluarga terdampak banjir yang kehilangan pekerjaan sementara.', 'diverifikasi', 1),
(2, 'Gunungpati', 'Gunungpati', 'Ahmad Hidayat', '3374016005900003', 'Gunungpati RT 05/RW 03, Gunungpati', '081112223333', 'Bantuan biaya pengobatan dan kebutuhan dasar untuk korban luka berat akibat longsor.', 'survey_dijadwalkan', 2),
(3, 'Pandean Lamper', 'Semarang Selatan', 'Rina Marlina', '3374014508850001', 'Jl. Pandanaran No. 25, RT 01/RW 01, Pandean Lamper', '082223334444', 'Bantuan sembako dan kebutuhan bayi untuk keluarga dengan anak balita.', 'pending', 3),
(4, 'Penggaron Kidul', 'Pedurungan', 'Budi Santoso', '3374015512900005', 'Jl. Raya Penggaron No. 12, Penggaron Kidul', '083334445555', 'Bantuan logistik untuk pengungsi banjir di posko darurat. Total 60 KK membutuhkan bantuan.', 'lolos_survey', 1),
(5, 'Genuk', 'Genuk', 'Dewi Lestari', '3374014803950004', 'Jl. Genuk Raya No. 30, Genuk', '084445556666', 'Bantuan perbaikan rumah akibat kerusakan angin puting beliung.', 'selesai', 2);

-- ============================================================
-- 14. INFRASTRUKTUR PROPOSALS
-- ============================================================
INSERT INTO infrastruktur_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, status, aset_milik_opd_lain, opd_nama, created_by) VALUES
(1, 'Kaligawe', 'Semarang Utara', 'Perbaikan jalan lingkungan RT 03/RW 02 yang rusak akibat banjir. Jalan sepanjang 500 meter perlu diperbaiki.', 'diverifikasi', 0, NULL, 1),
(2, 'Gunungpati', 'Gunungpati', 'Rehabilitasi jalan akses utama yang tertutup material longsor. Diperlukan alat berat untuk pembersihan.', 'dalam_pengerjaan', 0, NULL, 2),
(4, 'Penggaron Kidul', 'Pedurungan', 'Perbaikan saluran drainase yang tersumbat akibat sedimentasi banjir. Panjang saluran 300 meter.', 'pending', 1, 'Dinas PU', 3),
(6, 'Karangturi', 'Semarang Timur', 'Pemasangan bronjong di bantaran sungai untuk mencegah banjir susulan. Panjang 200 meter.', 'pending', 0, NULL, 1);

-- ============================================================
-- 15. STATUS HISTORY (Riwayat Status Usulan)
-- ============================================================
INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, updated_by, created_at) VALUES
-- Air Bersih
('air_bersih', 1, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-01 09:00:00'),
('air_bersih', 1, 'pending', 'diproses', 'Sedang diproses tim', 1, '2026-09-01 10:00:00'),
('air_bersih', 1, 'diproses', 'selesai', 'Air bersih sudah didistribusikan', 1, '2026-09-02 08:00:00'),
('air_bersih', 2, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-03 08:00:00'),
('air_bersih', 2, 'pending', 'diproses', 'Sedang diproses', 2, '2026-09-03 14:00:00'),
-- Bansos
('bansos', 1, NULL, 'pending', 'Usulan bansos dibuat', 1, '2026-09-01 11:00:00'),
('bansos', 1, 'pending', 'diverifikasi', 'Diverifikasi oleh admin', 1, '2026-09-02 09:00:00'),
('bansos', 2, NULL, 'pending', 'Usulan bansos dibuat', 2, '2026-09-02 10:00:00'),
('bansos', 2, 'pending', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 08:00:00'),
('bansos', 2, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan minggu depan', 2, '2026-09-03 10:00:00'),
('bansos', 4, NULL, 'pending', 'Usulan dibuat', 1, '2026-09-04 08:00:00'),
('bansos', 4, 'pending', 'diverifikasi', 'Diverifikasi', 1, '2026-09-04 10:00:00'),
('bansos', 4, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 1, '2026-09-05 08:00:00'),
('bansos', 4, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey turun ke lapangan', 1, '2026-09-06 08:00:00'),
('bansos', 4, 'sedang_survey', 'lolos_survey', 'Lolos survey, layak mendapat bantuan', 1, '2026-09-07 14:00:00'),
('bansos', 5, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-05 09:00:00'),
('bansos', 5, 'pending', 'selesai', 'Bantuan sudah disalurkan', 2, '2026-09-07 16:00:00'),
-- Infrastruktur
('infrastruktur', 1, NULL, 'pending', 'Usulan infrastruktur dibuat', 1, '2026-09-01 12:00:00'),
('infrastruktur', 1, 'pending', 'diverifikasi', 'Diverifikasi oleh admin', 1, '2026-09-02 08:00:00'),
('infrastruktur', 2, NULL, 'pending', 'Usulan dibuat', 2, '2026-09-02 11:00:00'),
('infrastruktur', 2, 'pending', 'diverifikasi', 'Diverifikasi', 2, '2026-09-03 08:00:00'),
('infrastruktur', 2, 'diverifikasi', 'survey_dijadwalkan', 'Survey dijadwalkan', 2, '2026-09-03 10:00:00'),
('infrastruktur', 2, 'survey_dijadwalkan', 'sedang_survey', 'Tim survey ke lokasi', 2, '2026-09-04 08:00:00'),
('infrastruktur', 2, 'sedang_survey', 'lolos_survey', 'Lolos survey', 2, '2026-09-05 14:00:00'),
('infrastruktur', 2, 'lolos_survey', 'dalam_pengerjaan', 'Pengerjaan dimulai', 2, '2026-09-06 08:00:00');

-- ============================================================
-- SELESAI! Berikut akun yang bisa digunakan:
-- Admin   : admin@ilmannafia.go.id       / admin123
-- Petugas : petugas@bpbdsemarang.go.id   / admin123
-- Petugas : ahmad@bpbdsemarang.go.id     / admin123
-- Petugas : dewi@bpbdsemarang.go.id      / admin123
-- Petugas : budi@bpbdsemarang.go.id      / admin123
-- Petugas : siti@bpbdsemarang.go.id      / admin123
-- ============================================================
