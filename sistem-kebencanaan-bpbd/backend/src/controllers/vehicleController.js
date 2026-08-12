const pool = require('../config/db');

exports.createVehicle = async (req, res) => {
  try {
    const { plate_number, type, status, last_service_date, posko_id } = req.body;

    if (!plate_number) {
      return res.status(400).json({ message: 'Nomor plat wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO vehicles (plate_number, type, status, last_service_date, posko_id)
       VALUES (?, ?, ?, ?, ?)`,
      [plate_number, type || null, status || 'siap', last_service_date || null, posko_id || null]
    );

    res.status(201).json({ message: 'Kendaraan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const { status, posko_id } = req.query;
    let query = `
      SELECT v.*, p.name AS posko_name
      FROM vehicles v
      LEFT JOIN posko p ON v.posko_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }
    if (posko_id) {
      query += ' AND v.posko_id = ?';
      params.push(posko_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_number, type, status, last_service_date, posko_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }

    await pool.query(
      `UPDATE vehicles SET
        plate_number = COALESCE(?, plate_number),
        type = COALESCE(?, type),
        status = COALESCE(?, status),
        last_service_date = COALESCE(?, last_service_date),
        posko_id = COALESCE(?, posko_id)
       WHERE id = ?`,
      [plate_number, type, status, last_service_date, posko_id, id]
    );

    res.json({ message: 'Kendaraan berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }

    res.json({ message: 'Kendaraan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};