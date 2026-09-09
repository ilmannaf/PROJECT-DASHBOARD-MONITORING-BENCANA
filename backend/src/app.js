const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Izinkan semua origin yang sudah didaftarkan
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Izinkan semua localhost dengan port berapapun
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    // Izinkan semua IP lokal (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^http:\/\/(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\.\d+\.\d+(:\d+)?$/.test(origin)) return callback(null, true);
    callback(new Error('CORS: origin tidak diizinkan'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Biar foto yang diupload bisa diakses lewat URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server backend berjalan' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/inventory', inventoryRoutes);

const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/vehicles', vehicleRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activities', activityRoutes);

const infoBoardRoutes = require('./routes/infoBoardRoutes');
app.use('/api/info-board', infoBoardRoutes);

const poskoRoutes = require('./routes/poskoRoutes');
app.use('/api/posko', poskoRoutes);

const disasterRoutes = require('./routes/disasterRoutes');
app.use('/api/disaster-records', disasterRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const publicRoutes = require('./routes/publicRoutes');
app.use('/api/public', publicRoutes);

const bidang3Routes = require('./routes/bidang3Routes');
app.use('/api/bidang3', bidang3Routes);

const waterDistributionRoutes = require('./routes/waterDistributionRoutes');
app.use('/api/water-distributions', waterDistributionRoutes);

const waterSupplySettingsRoutes = require('./routes/waterSupplySettingsRoutes');
app.use('/api/water-supply-settings', waterSupplySettingsRoutes);

const unexpectedExpenditureRoutes = require('./routes/unexpectedExpenditureRoutes');
app.use('/api/unexpected-expenditures', unexpectedExpenditureRoutes);

const bttPenerimaRoutes = require('./routes/bttPenerimaRoutes');
app.use('/api/btt-penerima', bttPenerimaRoutes);

const locationRoutes = require('./routes/locationRoutes');
app.use('/api/locations', locationRoutes);

// 404 handler untuk route yang tidak ada
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Global error handler (menangkap error dari multer dll)
app.use((err, req, res, next) => {
  console.error(err);
  // handle multer file limit errors dengan pesan user-friendly
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran foto maksimal 5MB per file' });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Maksimal 5 foto' });
  }
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan server',
  });
});

module.exports = app;