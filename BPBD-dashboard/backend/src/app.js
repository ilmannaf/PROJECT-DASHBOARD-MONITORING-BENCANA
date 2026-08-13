const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

module.exports = app;