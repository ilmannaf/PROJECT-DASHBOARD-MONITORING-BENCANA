const express = require('express');
const router = express.Router();
const {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  exportLocations,
} = require('../controllers/locationController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/:type', getLocations);
router.get('/:type/export', verifyToken, requireRole('admin'), exportLocations);
router.post('/:type', verifyToken, requireRole('admin'), createLocation);
router.put('/:type/:id', verifyToken, requireRole('admin'), updateLocation);
router.delete('/:type/:id', verifyToken, requireRole('admin'), deleteLocation);

module.exports = router;
