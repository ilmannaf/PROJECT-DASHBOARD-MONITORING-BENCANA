const pool = require('../config/db');

exports.createDisasterRecord = async (req, res) => {
  try {
    const { disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, kronologi, korban, kerugian, sumber_info_nama, sumber_info_phone } = req.body;

    if (!disaster_date || !disaster_time || !location || !kelurahan || !kecamatan || !kronologi || !sumber_info_nama || !sumber_info_phone) {
      return res.status(400).json({ message: 'Tanggal, jam, lokasi, kelurahan, kecamatan, kronologi, dan sumber info wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO disaster_records (disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, kronologi, korban, kerugian, sumber_info_nama, sumber_info_phone, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik || null, kronologi, korban || null, kerugian || null, sumber_info_nama, sumber_info_phone, req.user.id]
    );

    res.status(201).json({ message: 'Pendataan bencana berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDisasterRecords = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dr.*, u.name AS created_by_name
      FROM disaster_records dr
      LEFT JOIN users u ON dr.created_by = u.id
      ORDER BY dr.disaster_date DESC, dr.disaster_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDisasterRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT dr.*, u.name AS created_by_name
      FROM disaster_records dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateDisasterRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, kronologi, korban, kerugian, sumber_info_nama, sumber_info_phone } = req.body;

    const [existing] = await pool.query('SELECT * FROM disaster_records WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    await pool.query(
      `UPDATE disaster_records SET
        disaster_date = COALESCE(?, disaster_date),
        disaster_time = COALESCE(?, disaster_time),
        location = COALESCE(?, location),
        kelurahan = COALESCE(?, kelurahan),
        kecamatan = COALESCE(?, kecamatan),
        pemilik = COALESCE(?, pemilik),
        kronologi = COALESCE(?, kronologi),
        korban = COALESCE(?, korban),
        kerugian = COALESCE(?, kerugian),
        sumber_info_nama = COALESCE(?, sumber_info_nama),
        sumber_info_phone = COALESCE(?, sumber_info_phone)
       WHERE id = ?`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, kronologi, korban, kerugian, sumber_info_nama, sumber_info_phone, id]
    );

    res.json({ message: 'Data pendataan bencana berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteDisasterRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM disaster_records WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data pendataan bencana berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
