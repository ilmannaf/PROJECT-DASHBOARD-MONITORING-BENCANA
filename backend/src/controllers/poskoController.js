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

// UPDATE - Update posko
exports.updatePosko = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nama posko wajib diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM posko WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Posko tidak ditemukan' });
    }

    await pool.query(
      'UPDATE posko SET name = ?, address = ? WHERE id = ?',
      [name, address || null, id]
    );

    res.json({ message: 'Posko berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE - Hapus posko
exports.deletePosko = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM posko WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Posko tidak ditemukan' });
    }

    // Cek apakah posko masih dipakai
    const [inUse] = await pool.query(
      'SELECT id FROM inventory_items WHERE posko_id = ? LIMIT 1',
      [id]
    );
    if (inUse.length > 0) {
      return res.status(400).json({ message: 'Posko masih digunakan oleh data inventaris' });
    }

    await pool.query('DELETE FROM posko WHERE id = ?', [id]);
    res.json({ message: 'Posko berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};