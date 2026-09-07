const express = require('express');
const router = express.Router();
const { getPosko, createPosko, updatePosko, deletePosko } = require('../controllers/poskoController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, getPosko);
router.post('/', verifyToken, requireRole('admin'), createPosko);
router.put('/:id', verifyToken, requireRole('admin'), updatePosko);
router.delete('/:id', verifyToken, requireRole('admin'), deletePosko);

module.exports = router;