const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportByTrackingCode, updateReportStatus } = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Publik - gak perlu login
router.post('/', upload.single('photo'), createReport);
router.get('/track/:code', getReportByTrackingCode);

// Admin/petugas - perlu login
router.get('/', verifyToken, getReports);
router.patch('/:id/status', verifyToken, updateReportStatus);

module.exports = router;