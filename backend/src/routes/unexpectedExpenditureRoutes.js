const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  createUnexpectedExpenditure,
  getUnexpectedExpenditures,
  getUnexpectedExpenditureById,
  updateUnexpectedExpenditureStatus,
  deleteUnexpectedExpenditure,
  getUnexpectedExpenditureStats
} = require('../controllers/unexpectedExpenditureController');

// ========================================
// UNEXPECTED EXPENDITURE (Belanja Tidak Terduga / BTT)
// ========================================
router.get('/stats', verifyToken, getUnexpectedExpenditureStats);
router.get('/', verifyToken, getUnexpectedExpenditures);
router.get('/:id', verifyToken, getUnexpectedExpenditureById);
router.post('/', verifyToken, requireRole('admin'), upload.single('bukti'), createUnexpectedExpenditure);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateUnexpectedExpenditureStatus);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUnexpectedExpenditure);

module.exports = router;
