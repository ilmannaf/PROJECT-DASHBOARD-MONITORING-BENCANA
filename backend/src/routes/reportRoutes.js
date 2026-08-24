const express = require('express');
const router = express.Router();
const { createReport, getReports, getMyReports, getReportByTrackingCode, updateReportStatus, getPublicReports } = require('../controllers/reportController');
const { verifyToken, optionalVerifyToken, requireRole } = require('../middlewares/authMiddleware');
const { reportLimiter } = require('../middlewares/rateLimit');
const upload = require('../middlewares/uploadMiddleware');

// Publik - gak perlu login
router.get('/public', getPublicReports);
router.post('/', reportLimiter, optionalVerifyToken, upload.single('photo'), createReport);
router.get('/track/:code', getReportByTrackingCode);

// User yang login
router.get('/my-reports', verifyToken, getMyReports);

// Admin/petugas - perlu login
router.get('/', verifyToken, requireRole('admin', 'petugas'), getReports);
router.patch('/:id/status', verifyToken, requireRole('admin', 'petugas'), updateReportStatus);

module.exports = router;