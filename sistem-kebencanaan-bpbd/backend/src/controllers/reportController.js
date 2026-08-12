const pool = require('../config/db');
const generateTrackingCode = require('../utils/generateTrackingCode');

// CREATE - Submit laporan baru (publik, tanpa login)
exports.createReport = async (req, res) => {
  try {
    const { reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address } = req.body;

    if (!reporter_name || !disaster_type || !address) {
      return res.status(400).json({ message: 'Nama pelapor, jenis bencana, dan alamat wajib diisi' });
    }

    const tracking_code = generateTrackingCode();
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO reports (tracking_code, reporter_name, reporter_phone, disaster_type, description, photo_url, latitude, longitude, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'baru')`,
      [tracking_code, reporter_name, reporter_phone || null, disaster_type, description || null, photo_url, latitude || null, longitude || null, address]
    );

    // Kirim notifikasi real-time ke dashboard admin
    const io = req.app.get('io');
    io.emit('new_report', { id: result.insertId, tracking_code, disaster_type, address, status: 'baru' });

    res.status(201).json({
      message: 'Laporan berhasil dikirim',
      tracking_code,
      report_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List semua laporan (admin/petugas, butuh login)
exports.getReports = async (req, res) => {
  try {
    const { status, disaster_type } = req.query;
    let query = `
      SELECT r.*, u.name AS assigned_name
      FROM reports r
      LEFT JOIN users u ON r.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }
    if (disaster_type) {
      query += ' AND r.disaster_type = ?';
      params.push(disaster_type);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - Cek status via tracking code (publik)
exports.getReportByTrackingCode = async (req, res) => {
  try {
    const { code } = req.params;

    const [rows] = await pool.query('SELECT * FROM reports WHERE tracking_code = ?', [code]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    const [logs] = await pool.query(
      'SELECT * FROM report_logs WHERE report_id = ? ORDER BY created_at ASC',
      [rows[0].id]
    );

    res.json({ report: rows[0], history: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE - Ubah status laporan (admin/petugas)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assigned_to } = req.body;

    const validStatus = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      'UPDATE reports SET status = ?, assigned_to = COALESCE(?, assigned_to) WHERE id = ?',
      [status, assigned_to || null, id]
    );

    await pool.query(
      'INSERT INTO report_logs (report_id, status_from, status_to, note, updated_by) VALUES (?, ?, ?, ?, ?)',
      [id, statusFrom, status, note || null, req.user.id]
    );

    // Notifikasi real-time perubahan status
    const io = req.app.get('io');
    io.emit('report_status_updated', { id, status, tracking_code: existing[0].tracking_code });

    res.json({ message: 'Status laporan berhasil diperbarui', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};