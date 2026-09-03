const express = require('express');
const router = express.Router();
const { register, login, getLoginHistory } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimit');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/history', verifyToken, getLoginHistory);

module.exports = router;