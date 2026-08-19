const pool = require('../config/db');

// READ - List semua posko
exports.getPosko = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posko ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// CREATE - Tambah posko baru (opsional, kalau nanti butuh nambah lokasi)
exports.createPosko = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama posko wajib diisi' });
    }

    const [result] = await pool.query(
      'INSERT INTO posko (name, address) VALUES (?, ?)',
      [name, address || null]
    );

    res.status(201).json({ message: 'Posko berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};