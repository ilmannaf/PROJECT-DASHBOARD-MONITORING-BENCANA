const express = require('express');
const router = express.Router();
const { createItem, getItems, updateItem, deleteItem } = require('../controllers/inventoryController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken); // semua endpoint inventory butuh login

router.post('/', requireRole('admin'), createItem);
router.get('/', getItems);
router.patch('/:id', requireRole('admin'), updateItem);
router.delete('/:id', requireRole('admin'), deleteItem);

module.exports = router;