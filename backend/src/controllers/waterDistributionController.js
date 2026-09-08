const pool = require('../config/db');

// ========================================
// WATER DISTRIBUTION (Distribusi Air Bersih)
// ========================================

exports.createWaterDistribution = async (req, res) => {
  try {
    const { disaster_record_id, kelurahan, kecamatan, nama_distribusi, lokasi_distribusi, jumlah_kubikasi, target_penerima, keterangan } = req.body;

    if (!disaster_record_id || !kelurahan || !nama_distribusi) {
      return res.status(400).json({ message: 'Disaster record ID, kelurahan, dan nama distribusi wajib diisi' });
    }

    const [disaster] = await pool.query('SELECT id FROM disaster_records WHERE id = ?', [disaster_record_id]);
    if (disaster.length === 0) {
      return res.status(404).json({ message: 'Data bencana tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO water_distributions (disaster_record_id, kelurahan, kecamatan, nama_distribusi, lokasi_distribusi, jumlah_kubikasi, target_penerima, keterangan, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_record_id, kelurahan, kecamatan || null, nama_distribusi, lokasi_distribusi || null, jumlah_kubikasi || null, target_penerima || null, keterangan || null, req.user.id]
    );

    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES ('water_distribution', ?, 'pending', 'Distribusi dibuat', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Data distribusi air berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getWaterDistributions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wd.*, dr.location, dr.disaster_date, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN disaster_records dr ON wd.disaster_record_id = dr.id
      LEFT JOIN users u ON wd.created_by = u.id
      ORDER BY wd.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getWaterDistributionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT wd.*, dr.location, dr.disaster_date, dr.kelurahan AS disaster_kelurahan, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN disaster_records dr ON wd.disaster_record_id = dr.id
      LEFT JOIN users u ON wd.created_by = u.id
      WHERE wd.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const [history] = await pool.query(
      `SELECT sh.*, u.name AS updated_by_name FROM status_history sh
       LEFT JOIN users u ON sh.updated_by = u.id
       WHERE sh.proposal_type = 'water_distribution' AND sh.proposal_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    res.json({ ...rows[0], status_history: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateWaterDistributionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, bukti_dukung_url } = req.body;

    const validStatuses = ['pending', 'dalam_perjalanan', 'selesai', 'dibatalkan'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM water_distributions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      `UPDATE water_distributions SET status = ?, bukti_dukung_url = COALESCE(?, bukti_dukung_url) WHERE id = ?`,
      [status, bukti_dukung_url || null, id]
    );

    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, bukti_dukung_url, updated_by)
       VALUES ('water_distribution', ?, ?, ?, ?, ?, ?)`,
      [id, statusFrom, status, note || null, bukti_dukung_url || null, req.user.id]
    );

    res.json({ message: 'Status distribusi air berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteWaterDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM water_distributions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data distribusi air berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getWaterDistributionStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'dalam_perjalanan') as dalam_perjalanan,
        SUM(status = 'selesai') as selesai,
        SUM(status = 'dibatalkan') as dibatalkan,
        COALESCE(SUM(jumlah_kubikasi), 0) as total_kubikasi
      FROM water_distributions
    `);
    res.json(stats[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
