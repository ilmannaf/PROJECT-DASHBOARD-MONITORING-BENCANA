const express = require('express');
const router = express.Router();
const { getPosko, createPosko } = require('../controllers/poskoController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getPosko);
router.post('/', verifyToken, requireRole('admin'), createPosko);

module.exports = router;