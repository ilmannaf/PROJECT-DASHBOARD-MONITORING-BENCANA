const pool = require('../config/db');

// CREATE - Tambah kegiatan
exports.createActivity = async (req, res) => {
  try {
    const { title, description, activity_date, location } = req.body;

    if (!title || !activity_date) {
      return res.status(400).json({ message: 'Judul dan tanggal kegiatan wajib diisi' });
    }

    const documentation_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO activities (title, description, activity_date, location, documentation_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, activity_date, location || null, documentation_url, req.user.id]
    );

    res.status(201).json({ message: 'Kegiatan berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List semua kegiatan
exports.getActivities = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.name AS created_by_name
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.activity_date DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, activity_date, location } = req.body;

    const [existing] = await pool.query('SELECT * FROM activities WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    const documentation_url = req.file ? `/uploads/${req.file.filename}` : existing[0].documentation_url;

    await pool.query(
      `UPDATE activities SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        activity_date = COALESCE(?, activity_date),
        location = COALESCE(?, location),
        documentation_url = ?
       WHERE id = ?`,
      [title, description, activity_date, location, documentation_url, id]
    );

    res.json({ message: 'Kegiatan berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM activities WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    res.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};