const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
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

const poskoRoutes = require('./routes/poskoRoutes');
app.use('/api/posko', poskoRoutes);

const disasterRoutes = require('./routes/disasterRoutes');
app.use('/api/disaster-records', disasterRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// 404 handler untuk route yang tidak ada
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Global error handler (menangkap error dari multer dll)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan server',
  });
});

module.exports = app;