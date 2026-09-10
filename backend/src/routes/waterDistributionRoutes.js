const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getDistributions,
  getDistributionById,
  createDistribution,
  updateDistribution,
  deleteDistribution,
  getSummary,
  exportDistributionsExcel
} = require('../controllers/waterDistributionController');

// ========================================
// WATER DISTRIBUTION (Distribusi Air Bersih)
// ========================================
router.get('/', verifyToken, getDistributions);
router.get('/summary', verifyToken, getSummary);
router.get('/export', verifyToken, exportDistributionsExcel);
router.get('/:id', verifyToken, getDistributionById);
router.post('/', verifyToken, requireRole('admin'), upload.uploadJpgUnder2Mb.single('documentation_photo'), createDistribution);
router.patch('/:id', verifyToken, requireRole('admin'), upload.uploadJpgUnder2Mb.single('documentation_photo'), updateDistribution);
router.delete('/:id', verifyToken, requireRole('admin'), deleteDistribution);

module.exports = router;
