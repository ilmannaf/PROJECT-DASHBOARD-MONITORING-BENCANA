const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// GET /api/profile/me - Ambil profil sendiri
exports.getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, wilayah, bio, status, photo_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/profile/me - Update profil sendiri
exports.updateMyProfile = async (req, res) => {
  try {
    const { bio, status } = req.body;
    const validStatuses = ['on_duty', 'off_duty', 'resting'];
    const profileStatus = validStatuses.includes(status) ? status : 'on_duty';

    // Ambil foto lama jika ada
    const [existing] = await pool.query('SELECT photo_url FROM users WHERE id = ?', [req.user.id]);
    let photoUrl = existing.length > 0 ? existing[0].photo_url : null;

    // Handle upload foto baru
    if (req.file) {
      // Hapus foto lama jika ada
      if (photoUrl) {
        const oldPath = path.join(__dirname, '../../uploads', path.basename(photoUrl));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      photoUrl = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE users SET bio = ?, status = ?, photo_url = ? WHERE id = ?',
      [bio || null, profileStatus, photoUrl, req.user.id]
    );

    const [updated] = await pool.query(
      'SELECT id, name, email, role, wilayah, bio, status, photo_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profil berhasil diperbarui',
      user: updated[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/profile/petugas - Admin: Ambil semua profil petugas
exports.getAllPetugasProfiles = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, wilayah, bio, status, photo_url, created_at
       FROM users
       WHERE role = 'petugas'
       ORDER BY id ASC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/profile/petugas/:id - Admin: Ambil profil petugas tertentu
exports.getPetugasProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, name, email, role, wilayah, bio, status, photo_url, created_at
       FROM users
       WHERE id = ? AND role = 'petugas'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Petugas tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
