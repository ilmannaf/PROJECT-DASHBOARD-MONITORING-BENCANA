const pool = require('../config/db');

// CREATE
exports.createInfoBoard = async (req, res) => {
  try {
    const { title, info_date, start_time, end_time, location, description } = req.body;

    if (!title || !info_date || !start_time) {
      return res.status(400).json({ message: 'Judul, tanggal, dan jam mulai wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO info_board (title, info_date, start_time, end_time, location, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, info_date, start_time, end_time || null, location || null, description || null, req.user.id]
    );

    res.status(201).json({ message: 'Informasi berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List semua (admin)
exports.getInfoBoard = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ib.*, u.name AS created_by_name
      FROM info_board ib
      LEFT JOIN users u ON ib.created_by = u.id
      ORDER BY ib.info_date DESC, ib.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List yang aktif saja (public)
exports.getInfoBoardPublic = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ib.*, u.name AS created_by_name
      FROM info_board ib
      LEFT JOIN users u ON ib.created_by = u.id
      WHERE ib.is_active = 1
      ORDER BY ib.info_date DESC, ib.start_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE
exports.updateInfoBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, info_date, start_time, end_time, location, description, is_active } = req.body;

    const [existing] = await pool.query('SELECT * FROM info_board WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    await pool.query(
      `UPDATE info_board SET
        title = COALESCE(?, title),
        info_date = COALESCE(?, info_date),
        start_time = COALESCE(?, start_time),
        end_time = ?,
        location = COALESCE(?, location),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        title, info_date, start_time,
        end_time !== undefined ? end_time : existing[0].end_time,
        location, description,
        is_active !== undefined ? is_active : existing[0].is_active,
        id
      ]
    );

    res.json({ message: 'Informasi berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE
exports.deleteInfoBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM info_board WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Informasi berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
