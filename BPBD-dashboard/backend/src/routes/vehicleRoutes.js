const express = require('express');
const router = express.Router();
const { createVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', createVehicle);
router.get('/', getVehicles);
router.patch('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;