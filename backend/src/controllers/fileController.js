const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const uploadRoot = path.join(__dirname, '../../uploads');
const publicUploadDir = path.join(uploadRoot, 'public');
const privateUploadDir = path.join(uploadRoot, 'private');
const legacyUploadDir = uploadRoot;

const isAuthorized = (req) => {
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = headerToken || req.query.token;
  if (!token) return false;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return ['admin', 'petugas'].includes(user.role);
  } catch (_) {
    return false;
  }
};

const sendIfExists = (res, directory, filename) => {
  const filePath = path.join(directory, filename);
  if (!fs.existsSync(filePath)) return false;
  res.sendFile(filePath);
  return true;
};

exports.serveUpload = async (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename || filename !== req.params.filename) {
    return res.status(400).json({ message: 'Nama file tidak valid' });
  }

  if (sendIfExists(res, publicUploadDir, filename)) return;

  try {
    const publicPath = `/uploads/${filename}`;
    const [[publicReport]] = await pool.query(
      `SELECT 1 AS allowed FROM reports WHERE photo_url = ?
       UNION ALL
       SELECT 1 AS allowed FROM report_photos WHERE photo_url = ?
       LIMIT 1`,
      [publicPath, publicPath],
    );
    if (publicReport && sendIfExists(res, legacyUploadDir, filename)) return;
  } catch (_) {}

  if (!isAuthorized(req)) {
    return res.status(401).json({ message: 'Autentikasi diperlukan untuk mengakses file ini' });
  }

  if (sendIfExists(res, privateUploadDir, filename)) return;
  if (sendIfExists(res, legacyUploadDir, filename)) return;
  return res.status(404).json({ message: 'File tidak ditemukan' });
};
