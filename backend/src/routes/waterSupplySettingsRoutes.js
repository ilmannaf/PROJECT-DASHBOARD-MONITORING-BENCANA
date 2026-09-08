const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const controller = require('../controllers/waterSupplySettingsController');

router.get('/', verifyToken, controller.getSupplySettings);
router.put('/', verifyToken, requireRole('admin'), controller.updateSupplySettings);

module.exports = router;
