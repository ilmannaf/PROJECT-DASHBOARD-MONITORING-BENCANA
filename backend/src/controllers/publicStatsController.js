const pool = require('../config/db');

exports.getPublicStats = async (req, res) => {
  try {
    const [[reportRow]] = await pool.query('SELECT COUNT(*) AS total FROM reports');
    const [[vehicleRow]] = await pool.query('SELECT COUNT(*) AS total FROM vehicles');
    const [[poskoRow]] = await pool.query('SELECT COUNT(*) AS total FROM posko');

    res.json({
      laporan: reportRow.total,
      kendaraan: vehicleRow.total,
      posko: poskoRow.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
