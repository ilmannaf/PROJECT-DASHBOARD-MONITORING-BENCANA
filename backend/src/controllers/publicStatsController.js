const pool = require('../config/db');

exports.getPublicStats = async (req, res) => {
  try {
    const [[reportRow]] = await pool.query('SELECT COUNT(*) AS total FROM reports');
    const [[vehicleRow]] = await pool.query('SELECT COUNT(*) AS total FROM vehicles');
    const [[poskoRow]] = await pool.query('SELECT COUNT(*) AS total FROM posko');

    const [statusRows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM reports GROUP BY status'
    );
    const [typeRows] = await pool.query(
      'SELECT disaster_type AS name, COUNT(*) AS count FROM reports GROUP BY disaster_type'
    );

    res.json({
      laporan: reportRow.total,
      kendaraan: vehicleRow.total,
      posko: poskoRow.total,
      byStatus: Object.fromEntries(statusRows.map((r) => [r.status, r.count])),
      byType: typeRows.map((r) => ({ name: r.name, jumlah: r.count })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getPublicMonthlyStats = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await pool.query(
      `SELECT MONTH(created_at) AS month, COUNT(*) AS count
       FROM reports
       WHERE YEAR(created_at) = ?
       GROUP BY MONTH(created_at)
       ORDER BY MONTH(created_at)`,
      [year]
    );

    const monthly = Array(12).fill(0);
    rows.forEach((r) => { monthly[r.month - 1] = r.count; });

    res.json({ year: Number(year), monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getPublicMonthlyByType = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month;
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Parameter month wajib (1-12)' });
    }

    const [rows] = await pool.query(
      `SELECT disaster_type AS name, COUNT(*) AS jumlah
       FROM reports
       WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
       GROUP BY disaster_type
       ORDER BY jumlah DESC`,
      [year, month]
    );

    const [[totalRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM reports WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
      [year, month]
    );

    res.json({
      year: Number(year),
      month: Number(month),
      total: totalRow.total,
      byType: rows.map((r) => ({ name: r.name, jumlah: r.jumlah })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
