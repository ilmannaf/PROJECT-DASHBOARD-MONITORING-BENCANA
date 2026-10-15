const express = require('express');
const router = express.Router();
const { createReport, createAdminReport, getReports, getReportStats, getMyReports, getReportByTrackingCode, updateReportStatus, updateReportData, deleteReport, getPublicReports, exportReportsExcel } = require('../controllers/reportController');
const { verifyToken, optionalVerifyToken, requireRole } = require('../middlewares/authMiddleware');
const { reportLimiter, trackingLimiter } = require('../middlewares/rateLimit');
const upload = require('../middlewares/uploadMiddleware');
const publicUpload = upload.publicUpload;

// Publik - gak perlu login
router.get('/public', getPublicReports);
router.post('/', reportLimiter, optionalVerifyToken, publicUpload.fields([{ name: 'photo', maxCount: 1 }, { name: 'photos', maxCount: 5 }]), createReport);
router.post('/with-photos', reportLimiter, optionalVerifyToken, publicUpload.array('photos', 5), createReport);
router.get('/track/:code', trackingLimiter, getReportByTrackingCode);
router.post('/admin', verifyToken, requireRole('admin'), createAdminReport);

// User yang login
router.get('/my-reports', verifyToken, getMyReports);

// Admin/petugas - perlu login
router.get('/stats', verifyToken, requireRole('admin', 'petugas'), getReportStats);
router.get('/', verifyToken, requireRole('admin', 'petugas'), getReports);
router.get('/export', verifyToken, requireRole('admin', 'petugas'), exportReportsExcel);
router.patch('/:id/status', verifyToken, requireRole('admin', 'petugas'), updateReportStatus);
router.put('/:id', verifyToken, requireRole('admin'), updateReportData);
router.delete('/:id', verifyToken, requireRole('admin', 'petugas'), deleteReport);

module.exports = router;