const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip || '-';
};

const getLoginIdentifier = (user) => {
  const name = user?.name || 'Admin';
  const initials = String(name)
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();
  const identifier = user?.wilayah || user?.email?.split('@')[0] || '';
  return identifier ? `${name} (${initials || 'A'}) - ${identifier}` : `${name} (${initials || 'A'})`;
};

const getLoginHistoryColumn = async () => {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM login_history');
    const fieldNames = columns.map((column) => column.Field);

    if (fieldNames.includes('device_info')) return 'device_info';
    if (fieldNames.includes('user_agent')) return 'user_agent';
    return 'device_info';
  } catch (error) {
    return 'device_info';
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, wilayah } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = 'petugas';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, wilayah) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, wilayah || null]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: { id: result.insertId, name, email, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      try {
        const [userByEmail] = await pool.query('SELECT id, role, name, wilayah, email FROM users WHERE email = ?', [email]);
        if (userByEmail.length > 0 && userByEmail[0].role === 'admin') {
          await pool.query(
            'INSERT INTO login_history (user_id, ip_address, device_info, success) VALUES (?, ?, ?, 0)',
            [userByEmail[0].id, getClientIp(req), getLoginIdentifier(userByEmail[0])]
          );
        }
      } catch (_) {}
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (user.role === 'admin') {
        await pool.query(
          'INSERT INTO login_history (user_id, ip_address, device_info, success) VALUES (?, ?, ?, 0)',
          [user.id, getClientIp(req), getLoginIdentifier(user)]
        );
      }
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (user.role === 'admin') {
      await pool.query(
        'INSERT INTO login_history (user_id, ip_address, device_info, success) VALUES (?, ?, ?, 1)',
        [user.id, getClientIp(req), getLoginIdentifier(user)]
      );
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, wilayah: user.wilayah },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET LOGIN HISTORY (admin only)
exports.getLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const loginHistoryColumn = await getLoginHistoryColumn();

    const [rows] = await pool.query(`
      SELECT lh.id, lh.login_time, lh.ip_address, lh.${loginHistoryColumn}, lh.success,
             u.name, u.email, u.role, u.wilayah
      FROM login_history lh
      LEFT JOIN users u ON lh.user_id = u.id
      ORDER BY lh.login_time DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM login_history lh');
    const total = countRows[0].total;

    res.json({
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};