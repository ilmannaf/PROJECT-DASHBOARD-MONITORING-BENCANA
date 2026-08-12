const pool = require('../config/db');

// CREATE - Tambah item inventaris
exports.createItem = async (req, res) => {
  try {
    const { name, category, item_condition, quantity, unit, posko_id } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Nama dan kategori wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO inventory_items (name, category, item_condition, quantity, unit, posko_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, item_condition || 'baik', quantity || 0, unit || null, posko_id || null]
    );

    res.status(201).json({ message: 'Item berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// READ - List semua item (bisa difilter per posko/kategori)
exports.getItems = async (req, res) => {
  try {
    const { posko_id, category } = req.query;
    let query = `
      SELECT i.*, p.name AS posko_name
      FROM inventory_items i
      LEFT JOIN posko p ON i.posko_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (posko_id) {
      query += ' AND i.posko_id = ?';
      params.push(posko_id);
    }
    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }

    query += ' ORDER BY i.updated_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// UPDATE - Update kondisi/stok item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, item_condition, quantity, unit, posko_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM inventory_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    await pool.query(
      `UPDATE inventory_items SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        item_condition = COALESCE(?, item_condition),
        quantity = COALESCE(?, quantity),
        unit = COALESCE(?, unit),
        posko_id = COALESCE(?, posko_id)
       WHERE id = ?`,
      [name, category, item_condition, quantity, unit, posko_id, id]
    );

    res.json({ message: 'Item berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// DELETE - Hapus item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM inventory_items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    res.json({ message: 'Item berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};