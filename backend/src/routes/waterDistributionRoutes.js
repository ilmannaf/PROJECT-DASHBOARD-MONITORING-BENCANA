const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  createWaterDistribution,
  getWaterDistributions,
  getWaterDistributionById,
  updateWaterDistributionStatus,
  deleteWaterDistribution,
  getWaterDistributionStats
} = require('../controllers/waterDistributionController');

// ========================================
// WATER DISTRIBUTION (Distribusi Air Bersih)
// ========================================
router.get('/stats', verifyToken, getWaterDistributionStats);
router.get('/', verifyToken, getWaterDistributions);
router.get('/:id', verifyToken, getWaterDistributionById);
router.post('/', verifyToken, requireRole('admin'), createWaterDistribution);
router.patch('/:id/status', verifyToken, requireRole('admin'), updateWaterDistributionStatus);
router.delete('/:id', verifyToken, requireRole('admin'), deleteWaterDistribution);

module.exports = router;
