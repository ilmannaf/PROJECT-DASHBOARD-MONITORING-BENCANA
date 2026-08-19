const express = require('express');
const router = express.Router();
const { createVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', requireRole('admin'), createVehicle);
router.get('/', getVehicles);
router.patch('/:id', requireRole('admin'), updateVehicle);
router.delete('/:id', requireRole('admin'), deleteVehicle);

module.exports = router;