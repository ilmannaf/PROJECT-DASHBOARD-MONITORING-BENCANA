const express = require('express');
const router = express.Router();
const { getPosko, createPosko } = require('../controllers/poskoController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getPosko);
router.post('/', verifyToken, createPosko);

module.exports = router;