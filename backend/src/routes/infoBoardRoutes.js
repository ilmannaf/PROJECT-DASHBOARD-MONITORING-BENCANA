const express = require('express');
const router = express.Router();
const { createInfoBoard, getInfoBoard, updateInfoBoard, deleteInfoBoard } = require('../controllers/infoBoardController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Semua endpoint butuh login admin
router.use(verifyToken);

router.post('/', requireRole('admin'), createInfoBoard);
router.get('/', getInfoBoard);
router.patch('/:id', requireRole('admin'), updateInfoBoard);
router.delete('/:id', requireRole('admin'), deleteInfoBoard);

module.exports = router;
