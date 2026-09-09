const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { createBttPenerima, getBttPenerimaByBttId, getBttPenerimaById, updateBttPenerima, deleteBttPenerima } = require('../controllers/bttPenerimaController');

router.get('/btt/:btt_id', verifyToken, getBttPenerimaByBttId);
router.get('/:id', verifyToken, getBttPenerimaById);
router.post('/', verifyToken, requireRole('admin'), createBttPenerima);
router.put('/:id', verifyToken, requireRole('admin'), updateBttPenerima);
router.delete('/:id', verifyToken, requireRole('admin'), deleteBttPenerima);

module.exports = router;
