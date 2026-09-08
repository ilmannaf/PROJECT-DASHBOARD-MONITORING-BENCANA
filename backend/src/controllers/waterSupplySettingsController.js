const pool = require('../config/db');

exports.getSupplySettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM water_supply_settings ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) {
      await pool.query('INSERT INTO water_supply_settings (total_supply) VALUES (0)');
      const [newRow] = await pool.query('SELECT * FROM water_supply_settings ORDER BY id DESC LIMIT 1');
      return res.json(newRow[0]);
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateSupplySettings = async (req, res) => {
  try {
    const { total_supply } = req.body;
    if (total_supply === undefined || total_supply === null) {
      return res.status(400).json({ message: 'total_supply wajib diisi' });
    }

    const [existing] = await pool.query('SELECT * FROM water_supply_settings ORDER BY id DESC LIMIT 1');
    if (existing.length === 0) {
      await pool.query('INSERT INTO water_supply_settings (total_supply, updated_by) VALUES (?, ?)', [total_supply, req.user.id]);
    } else {
      await pool.query('UPDATE water_supply_settings SET total_supply = ?, updated_by = ? WHERE id = ?', [total_supply, req.user.id, existing[0].id]);
    }

    res.json({ message: 'Total persediaan air bersih berhasil diperbarui', total_supply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
