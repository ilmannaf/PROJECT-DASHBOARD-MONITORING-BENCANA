const pool = require('../config/db');

// ========================================
// UNEXPECTED EXPENDITURE (Belanja Tidak Terduga / BTT)
// ========================================

exports.createUnexpectedExpenditure = async (req, res) => {
  try {
    const { disaster_record_id, kelurahan, kecamatan, nama_pengeluaran, jumlah, keterangan, tanggal_pengeluaran } = req.body;

    if (!disaster_record_id || !kelurahan || !nama_pengeluaran || !jumlah) {
      return res.status(400).json({ message: 'Disaster record ID, kelurahan, nama pengeluaran, dan jumlah wajib diisi' });
    }

    const [disaster] = await pool.query('SELECT id FROM disaster_records WHERE id = ?', [disaster_record_id]);
    if (disaster.length === 0) {
      return res.status(404).json({ message: 'Data bencana tidak ditemukan' });
    }

    const bukti_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO unexpected_expenditures (disaster_record_id, kelurahan, kecamatan, nama_pengeluaran, jumlah, keterangan, tanggal_pengeluaran, bukti_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_record_id, kelurahan, kecamatan || null, nama_pengeluaran, jumlah, keterangan || null, tanggal_pengeluaran || null, bukti_url, req.user.id]
    );

    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES ('unexpected_expenditure', ?, 'pending', 'Pengeluaran dicatat', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Data pengeluaran tak terduga berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getUnexpectedExpenditures = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ue.*, dr.location, dr.disaster_date, u.name AS created_by_name
      FROM unexpected_expenditures ue
      LEFT JOIN disaster_records dr ON ue.disaster_record_id = dr.id
      LEFT JOIN users u ON ue.created_by = u.id
      ORDER BY ue.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getUnexpectedExpenditureById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT ue.*, dr.location, dr.disaster_date, dr.kelurahan AS disaster_kelurahan, u.name AS created_by_name
      FROM unexpected_expenditures ue
      LEFT JOIN disaster_records dr ON ue.disaster_record_id = dr.id
      LEFT JOIN users u ON ue.created_by = u.id
      WHERE ue.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const [history] = await pool.query(
      `SELECT sh.*, u.name AS updated_by_name FROM status_history sh
       LEFT JOIN users u ON sh.updated_by = u.id
       WHERE sh.proposal_type = 'unexpected_expenditure' AND sh.proposal_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    res.json({ ...rows[0], status_history: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateUnexpectedExpenditureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'diverifikasi', 'selesai', 'ditolak'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM unexpected_expenditures WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      `UPDATE unexpected_expenditures SET status = ? WHERE id = ?`,
      [status, id]
    );

    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, updated_by)
       VALUES ('unexpected_expenditure', ?, ?, ?, ?, ?)`,
      [id, statusFrom, status, note || null, req.user.id]
    );

    res.json({ message: 'Status pengeluaran tak terduga berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteUnexpectedExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM unexpected_expenditures WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data pengeluaran tak terduga berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getUnexpectedExpenditureStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'diverifikasi') as diverifikasi,
        SUM(status = 'selesai') as selesai,
        SUM(status = 'ditolak') as ditolak,
        COALESCE(SUM(jumlah), 0) as total_jumlah
      FROM unexpected_expenditures
    `);
    res.json(stats[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
