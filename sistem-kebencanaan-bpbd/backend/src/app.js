const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route buat testing awal
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server backend berjalan' });
});

// Nanti route lain ditambahkan di sini, contoh:
// const reportRoutes = require('./routes/reportRoutes');
// app.use('/api/reports', reportRoutes);

module.exports = app;