const pool = require('../config/db');

exports.createBttPenerima = async (req, res) => {
  try {
    const { btt_id, nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan } = req.body;

    if (!btt_id || !nama_penerima || !jenis_bencana || !tanggal_kejadian || !alamat || !besaran_bantuan) {
      return res.status(400).json({ message: 'Nama, tanggal kejadian, jenis bencana, alamat, dan besaran bantuan wajib diisi' });
    }
    if (!['belum_cair', 'cair', 'tidak_cair'].includes(status_pendanaan || 'belum_cair')) {
      return res.status(400).json({ message: 'Status pendanaan tidak valid' });
    }

    const [result] = await pool.query(
      `INSERT INTO btt_penerima (btt_id, nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [btt_id, nama_penerima, no_kk || null, nik || null, jenis_bencana, tanggal_kejadian, kategori_kerusakan || null, kerusakan || null, status_pendanaan || 'belum_cair', tanggal_pencairan || null, persentase_kerusakan || 100, alamat, kelurahan || null, kecamatan || null, besaran_bantuan, req.user.id]
    );

    res.status(201).json({ message: 'Data penerima berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBttPenerimaByBttId = async (req, res) => {
  try {
    const { btt_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM btt_penerima WHERE btt_id = ? ORDER BY id ASC', [btt_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBttPenerimaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM btt_penerima WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateBttPenerima = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan } = req.body;

    await pool.query(
      `UPDATE btt_penerima SET nama_penerima=?, no_kk=?, nik=?, jenis_bencana=?, tanggal_kejadian=?, kategori_kerusakan=?, kerusakan=?, status_pendanaan=?, tanggal_pencairan=?, persentase_kerusakan=?, alamat=?, kelurahan=?, kecamatan=?, besaran_bantuan=? WHERE id=?`,
      [nama_penerima, no_kk || null, nik || null, jenis_bencana, tanggal_kejadian, kategori_kerusakan || null, kerusakan || null, status_pendanaan || 'belum_cair', tanggal_pencairan || null, persentase_kerusakan || 100, alamat, kelurahan || null, kecamatan || null, besaran_bantuan, id]
    );

    res.json({ message: 'Data penerima berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteBttPenerima = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM btt_penerima WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ message: 'Data penerima berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
