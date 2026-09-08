const pool = require('../config/db');

exports.getDistributions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wd.*, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN users u ON wd.created_by = u.id
      ORDER BY wd.distribution_date DESC, wd.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDistributionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT wd.*, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN users u ON wd.created_by = u.id
      WHERE wd.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.createDistribution = async (req, res) => {
  try {
    const { distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status } = req.body;

    if (!distribution_date || !kelurahan || !kecamatan || !location_address) {
      return res.status(400).json({ message: 'Tanggal, kelurahan, kecamatan, dan alamat wajib diisi' });
    }

    const [result] = await pool.query(
      `INSERT INTO water_distributions (distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [distribution_date, kelurahan, kecamatan, location_address, latitude || null, longitude || null, amount_liters || 0, total_supply || 0, notes || null, status || 'selesai', req.user.id]
    );

    res.status(201).json({ message: 'Data pendistribusian air bersih berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM water_distributions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    await pool.query(
      `UPDATE water_distributions SET
        distribution_date = COALESCE(?, distribution_date),
        kelurahan = COALESCE(?, kelurahan),
        kecamatan = COALESCE(?, kecamatan),
        location_address = COALESCE(?, location_address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        amount_liters = COALESCE(?, amount_liters),
        total_supply = COALESCE(?, total_supply),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, total_supply, notes, status, id]
    );

    res.json({ message: 'Data pendistribusian air bersih berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM water_distributions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    res.json({ message: 'Data pendistribusian air bersih berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM water_distributions');
    const [inProcessRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'dalam_proses'");
    const [doneRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'selesai'");
    const [canceledRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'dibatalkan'");
    const [totalLitersRows] = await pool.query('SELECT COALESCE(CAST(SUM(amount_liters) AS UNSIGNED), 0) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [supplySettings] = await pool.query('SELECT total_supply FROM water_supply_settings ORDER BY id DESC LIMIT 1');
    const [uniqueTanks] = await pool.query('SELECT COUNT(DISTINCT location_address) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [uniqueKelurahan] = await pool.query('SELECT COUNT(DISTINCT kelurahan) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [uniqueKecamatan] = await pool.query('SELECT COUNT(DISTINCT kecamatan) AS total FROM water_distributions WHERE status != \'dibatalkan\'');

    const totalSupply = supplySettings.length > 0 ? supplySettings[0].total_supply : 0;
    const totalDistributed = totalLitersRows[0].total;
    const tersedia = totalSupply - totalDistributed;

    res.json({
      totalData: totalRows[0].total,
      inProcess: inProcessRows[0].total,
      selesai: doneRows[0].total,
      dibatalkan: canceledRows[0].total,
      totalLiters: totalDistributed,
      totalSupply: totalSupply,
      tersedia: tersedia > 0 ? tersedia : 0,
      totalTanks: uniqueTanks[0].total,
      totalKelurahan: uniqueKelurahan[0].total,
      totalKecamatan: uniqueKecamatan[0].total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
