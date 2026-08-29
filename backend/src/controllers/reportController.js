const pool = require('../config/db');
const generateTrackingCode = require('../utils/generateTrackingCode');
const ExcelJS = require('exceljs');

// Helper untuk ambil daftar foto dari request (support photo single + photos array max 5)
function extractUploadedFiles(req) {
  const files = [];
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      if (req.files.photos) files.push(...req.files.photos);
      if (req.files.photo) files.push(...req.files.photo);
    }
  }
  if (req.file) files.push(req.file);
  return files;
}

// CREATE - Submit laporan baru (publik, tanpa login)
exports.createReport = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { reporter_name, reporter_phone, disaster_type, description, latitude, longitude, address } = req.body;

    if (!reporter_name || !disaster_type || !address) {
      return res.status(400).json({ message: 'Nama pelapor, jenis bencana, dan alamat wajib diisi' });
    }

    const files = extractUploadedFiles(req);
    if (files.length > 5) {
      return res.status(400).json({ message: 'Maksimal 5 foto' });
    }

    const tracking_code = generateTrackingCode();
    const photo_url = files.length > 0 ? `/uploads/${files[0].filename}` : null;

    const reporter_user_id = null;

    // koordinat opsional - jika tidak ada tetap simpan null agar bisa tanpa titik peta
    const lat = latitude && latitude !== '' ? parseFloat(latitude) : null;
    const lng = longitude && longitude !== '' ? parseFloat(longitude) : null;
    const validLat = lat !== null && !isNaN(lat) ? lat : null;
    const validLng = lng !== null && !isNaN(lng) ? lng : null;

    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO reports (tracking_code, reporter_user_id, reporter_name, reporter_phone, disaster_type, description, photo_url, latitude, longitude, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'baru')`,
      [tracking_code, reporter_user_id, reporter_name, reporter_phone || null, disaster_type, description || null, photo_url, validLat, validLng, address]
    );

    const reportId = result.insertId;
    // simpan semua foto ke report_photos (untuk fitur max 5)
    for (const f of files) {
      const url = `/uploads/${f.filename}`;
      await conn.query('INSERT INTO report_photos (report_id, photo_url) VALUES (?, ?)', [reportId, url]);
    }
    await conn.commit();

    // Kirim notifikasi real-time ke dashboard admin
    const io = req.app.get('io');
    io.emit('new_report', { id: reportId, tracking_code, disaster_type, address, status: 'baru', latitude: validLat, longitude: validLng });

    res.status(201).json({
      message: 'Laporan berhasil dikirim',
      tracking_code,
      report_id: reportId,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    conn.release();
  }
};

// Helper untuk attach foto-foto ke list reports
async function attachPhotosToReports(reports) {
  if (reports.length === 0) return reports;
  const ids = reports.map((r) => r.id);
  const [photos] = await pool.query(`SELECT report_id, photo_url FROM report_photos WHERE report_id IN (?) ORDER BY id ASC`, [ids]);
  const map = {};
  photos.forEach((p) => {
    if (!map[p.report_id]) map[p.report_id] = [];
    map[p.report_id].push(p.photo_url);
  });
  return reports.map((r) => ({
    ...r,
    photos: map[r.id] || (r.photo_url ? [r.photo_url] : []),
  }));
}

// READ - Stats untuk dashboard (tanpa fetch semua data)
exports.getReportStats = async (req, res) => {
  try {
    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM reports GROUP BY status'
    );
    const [typeRows] = await pool.query(
      'SELECT disaster_type AS name, COUNT(*) AS count FROM reports GROUP BY disaster_type'
    );
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM reports');
    const [recentRows] = await pool.query(
      'SELECT r.*, u.name AS assigned_name FROM reports r LEFT JOIN users u ON r.assigned_to = u.id ORDER BY r.created_at DESC LIMIT 8'
    );
    const withPhotos = await attachPhotosToReports(recentRows);
    res.json({
      total: totalRows[0].total,
      byStatus: Object.fromEntries(statusRows.map((r) => [r.status, r.count])),
      byType: typeRows.map((r) => ({ name: r.name, jumlah: r.count })),
      recent: withPhotos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List semua laporan (admin/petugas, butuh login)
exports.getReports = async (req, res) => {
  try {
    const { status, disaster_type, search, date_from, date_to, page = 1, limit = 50 } = req.query;
    let countQuery = 'SELECT COUNT(*) AS total FROM reports r WHERE 1=1';
    let query = `
      SELECT r.*, u.name AS assigned_name
      FROM reports r
      LEFT JOIN users u ON r.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (status) {
      query += ' AND r.status = ?';
      countQuery += ' AND r.status = ?';
      params.push(status);
      countParams.push(status);
    }
    if (disaster_type) {
      query += ' AND r.disaster_type = ?';
      countQuery += ' AND r.disaster_type = ?';
      params.push(disaster_type);
      countParams.push(disaster_type);
    }
    if (search) {
      const like = `%${search}%`;
      query += ' AND (r.tracking_code LIKE ? OR r.reporter_name LIKE ? OR r.disaster_type LIKE ? OR r.address LIKE ? OR r.description LIKE ?)';
      countQuery += ' AND (r.tracking_code LIKE ? OR r.reporter_name LIKE ? OR r.disaster_type LIKE ? OR r.address LIKE ? OR r.description LIKE ?)';
      params.push(like, like, like, like, like);
      countParams.push(like, like, like, like, like);
    }
    if (date_from) {
      query += ' AND r.created_at >= ?';
      countQuery += ' AND r.created_at >= ?';
      params.push(date_from);
      countParams.push(date_from);
    }
    if (date_to) {
      query += ' AND r.created_at <= ?';
      countQuery += ' AND r.created_at <= ?';
      params.push(date_to + ' 23:59:59');
      countParams.push(date_to + ' 23:59:59');
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await pool.query(query, params);
    const withPhotos = await attachPhotosToReports(rows);
    res.json({ data: withPhotos, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List laporan user yang login
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM reports WHERE reporter_user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    const withPhotos = await attachPhotosToReports(rows);
    res.json(withPhotos);
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
    const [photos] = await pool.query('SELECT photo_url FROM report_photos WHERE report_id = ? ORDER BY id ASC', [rows[0].id]);
    const report = { ...rows[0], photos: photos.map((p) => p.photo_url) };
    if (report.photos.length === 0 && report.photo_url) report.photos = [report.photo_url];

    res.json({ report, history: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - Public reports untuk peta (tanpa data sensitif)
exports.getPublicReports = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, tracking_code, disaster_type, description, latitude, longitude, address, status, photo_url, created_at, updated_at
       FROM reports
       ORDER BY created_at DESC`
    );
    // attach photos
    let photoMap = {};
    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const [photos] = await pool.query(`SELECT report_id, photo_url FROM report_photos WHERE report_id IN (?)`, [ids]);
      photos.forEach((p) => {
        if (!photoMap[p.report_id]) photoMap[p.report_id] = [];
        photoMap[p.report_id].push(p.photo_url);
      });
    }
    // Filter: hanya kembalikan field aman; reporter_* sengaja tidak di-select
    const sanitized = rows.map((r) => ({
      id: r.id,
      tracking_code: r.tracking_code,
      disaster_type: r.disaster_type,
      description: r.description,
      latitude: r.latitude,
      longitude: r.longitude,
      address: r.address,
      status: r.status,
      photo_url: r.photo_url,
      photos: photoMap[r.id] || (r.photo_url ? [r.photo_url] : []),
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE - Hapus laporan (admin/petugas)
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    // hapus file foto fisik jika ada
    const [photos] = await pool.query('SELECT photo_url FROM report_photos WHERE report_id = ?', [id]);
    const fs = require('fs');
    const path = require('path');
    const allUrls = [...photos.map(p=>p.photo_url), existing[0].photo_url].filter(Boolean);
    for (const url of allUrls) {
      try {
        const filePath = path.join(__dirname, '../../uploads', path.basename(url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
    await pool.query('DELETE FROM reports WHERE id = ?', [id]);
    const io = req.app.get('io');
    io.emit('report_deleted', { id: Number(id) });
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE - Ubah status laporan (admin/petugas)
exports.updateReportStatus = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { id } = req.params;
    const { status, note, assigned_to } = req.body;

    const validStatus = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    let assignedToValue = null;
    if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') {
      const [assignees] = await conn.query(
        'SELECT id FROM users WHERE id = ? AND role IN (?, ?)',
        [assigned_to, 'admin', 'petugas']
      );

      if (assignees.length === 0) {
        return res.status(400).json({ message: 'Petugas tujuan tidak valid' });
      }

      assignedToValue = assigned_to;
    }

    await conn.beginTransaction();

    const [existing] = await conn.query('SELECT * FROM reports WHERE id = ? FOR UPDATE', [id]);
    if (existing.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await conn.query(
      'UPDATE reports SET status = ?, assigned_to = COALESCE(?, assigned_to) WHERE id = ?',
      [status, assignedToValue, id]
    );

    await conn.query(
      'INSERT INTO report_logs (report_id, status_from, status_to, note, updated_by) VALUES (?, ?, ?, ?, ?)',
      [id, statusFrom, status, note || null, req.user.id]
    );

    await conn.commit();

    const io = req.app.get('io');
    io.emit('report_status_updated', { id, status, tracking_code: existing[0].tracking_code });

    res.json({ message: 'Status laporan berhasil diperbarui', status });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  } finally {
    conn.release();
  }
};

// EXPORT EXCEL - Laporan Bencana
exports.exportReportsExcel = async (req, res) => {
  try {
    let query = `SELECT r.*, u.name AS assigned_name FROM reports r LEFT JOIN users u ON r.assigned_to = u.id WHERE 1=1`;
    const params = [];

    if (req.query.status) {
      query += ' AND r.status = ?';
      params.push(req.query.status);
    }
    if (req.query.disaster_type) {
      query += ' AND r.disaster_type = ?';
      params.push(req.query.disaster_type);
    }
    if (req.query.date_from) {
      query += ' AND r.created_at >= ?';
      params.push(req.query.date_from);
    }
    if (req.query.date_to) {
      query += ' AND r.created_at <= ?';
      params.push(req.query.date_to + ' 23:59:59');
    }

    query += ' ORDER BY r.created_at DESC';
    const [rows] = await pool.query(query, params);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'BPBD Kota Semarang';
    const ws = wb.addWorksheet('Laporan Bencana', { views: [{ state: 'frozen', ySplit: 1 }] });

    ws.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Kode Tracking', key: 'tracking_code', width: 22 },
      { header: 'Pelapor', key: 'reporter_name', width: 20 },
      { header: 'Jenis Bencana', key: 'disaster_type', width: 18 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Lokasi', key: 'address', width: 35 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Deskripsi', key: 'description', width: 40 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe65100' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    rows.forEach((r, i) => {
      ws.addRow({
        no: i + 1,
        tracking_code: r.tracking_code,
        reporter_name: r.reporter_name,
        disaster_type: r.disaster_type,
        status: r.status,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        description: r.description || '',
        created_at: new Date(r.created_at).toLocaleDateString('id-ID'),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-bencana.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal export Excel' });
  }
};