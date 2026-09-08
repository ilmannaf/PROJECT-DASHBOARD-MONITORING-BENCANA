const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const {
  getDistributions,
  getDistributionById,
  createDistribution,
  updateDistribution,
  deleteDistribution,
  getSummary
} = require('../controllers/waterDistributionController');

// ========================================
// WATER DISTRIBUTION (Distribusi Air Bersih)
// ========================================
router.get('/', verifyToken, getDistributions);
router.get('/summary', verifyToken, getSummary);
router.get('/:id', verifyToken, getDistributionById);
router.post('/', verifyToken, requireRole('admin'), createDistribution);
router.patch('/:id', verifyToken, requireRole('admin'), updateDistribution);
router.delete('/:id', verifyToken, requireRole('admin'), deleteDistribution);

module.exports = router;
