const pool = require('../config/db');
const ExcelJS = require('exceljs');

const CONFIG = {
  smab: {
    table: 'smab_locations',
    fields: ['nama_sekolah', 'kecamatan', 'ancaman_bencana', 'tahun_pembentukan', 'latitude', 'longitude'],
    required: ['nama_sekolah', 'kecamatan', 'latitude', 'longitude'],
    order: 'nama_sekolah ASC',
  },
  katana: {
    table: 'katana_locations',
    fields: ['kelurahan', 'kecamatan', 'pembentukan', 'ancaman_bencana', 'sumber_dana', 'latitude', 'longitude'],
    required: ['kelurahan', 'kecamatan', 'latitude', 'longitude'],
    order: 'kelurahan ASC',
  },
};

const getConfig = (type) => CONFIG[type];

const validatePayload = (config, payload) => {
  const missing = config.required.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
  if (missing.length > 0) return `Field wajib diisi: ${missing.join(', ')}`;

  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return 'Latitude harus berada antara -90 dan 90';
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return 'Longitude harus berada antara -180 dan 180';
  return null;
};

exports.getLocations = async (req, res) => {
  const config = getConfig(req.params.type);
  if (!config) return res.status(404).json({ message: 'Jenis lokasi tidak dikenal' });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${config.table} WHERE is_active = 1 ORDER BY ${config.order}`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createLocation = async (req, res) => {
  const config = getConfig(req.params.type);
  if (!config) return res.status(404).json({ message: 'Jenis lokasi tidak dikenal' });

  const validationError = validatePayload(config, req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const columns = [...config.fields, 'created_by'];
    const values = [...config.fields.map((field) => req.body[field] || null), req.user.id];
    const placeholders = columns.map(() => '?').join(', ');
    const [result] = await pool.query(
      `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values,
    );
    res.status(201).json({ message: 'Lokasi berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateLocation = async (req, res) => {
  const config = getConfig(req.params.type);
  if (!config) return res.status(404).json({ message: 'Jenis lokasi tidak dikenal' });

  const validationError = validatePayload(config, req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  try {
    const [existing] = await pool.query(`SELECT id FROM ${config.table} WHERE id = ?`, [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Lokasi tidak ditemukan' });

    const updates = config.fields.map((field) => `${field} = ?`).join(', ');
    const values = [...config.fields.map((field) => req.body[field] || null), req.params.id];
    await pool.query(`UPDATE ${config.table} SET ${updates} WHERE id = ?`, values);
    res.json({ message: 'Lokasi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteLocation = async (req, res) => {
  const config = getConfig(req.params.type);
  if (!config) return res.status(404).json({ message: 'Jenis lokasi tidak dikenal' });

  try {
    const [result] = await pool.query(`DELETE FROM ${config.table} WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    res.json({ message: 'Lokasi berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.exportLocations = async (req, res) => {
  const type = req.params.type;
  const config = getConfig(type);
  if (!config && type !== 'bencana') return res.status(404).json({ message: 'Jenis lokasi tidak dikenal' });

  try {
    const [rows] = type === 'bencana'
      ? await pool.query('SELECT tracking_code, reporter_name, reporter_phone, disaster_type, description, address, status, latitude, longitude, created_at FROM reports ORDER BY created_at DESC')
      : await pool.query(`SELECT ${config.fields.join(', ')} FROM ${config.table} WHERE is_active = 1 ORDER BY ${config.order}`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type === 'bencana' ? 'Bencana' : type.toUpperCase());
    worksheet.columns = rows.length > 0
      ? Object.keys(rows[0]).map((key) => ({ header: key.replaceAll('_', ' ').toUpperCase(), key, width: 22 }))
      : [{ header: 'DATA', key: 'data', width: 20 }];
    worksheet.addRows(rows);
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-lokasi.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengekspor data' });
  }
};
