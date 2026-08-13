const express = require('express');
const router = express.Router();
const { createItem, getItems, updateItem, deleteItem } = require('../controllers/inventoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken); // semua endpoint inventory butuh login

router.post('/', createItem);
router.get('/', getItems);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;