const express = require('express');
const router = express.Router();
const { createReport, getReports, getMyReports, getReportByTrackingCode, updateReportStatus } = require('../controllers/reportController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { reportLimiter } = require('../middlewares/rateLimit');
const upload = require('../middlewares/uploadMiddleware');

// Publik - gak perlu login
router.post('/', reportLimiter, upload.single('photo'), createReport);
router.get('/track/:code', getReportByTrackingCode);

// User yang login
router.get('/my-reports', verifyToken, getMyReports);

// Admin/petugas - perlu login
router.get('/', verifyToken, getReports);
router.patch('/:id/status', verifyToken, updateReportStatus);

module.exports = router;