const express = require('express');
const router = express.Router();
const { getUsers, createUser, resetPassword, deleteUser } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, requireRole('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/password', resetPassword);
router.delete('/:id', deleteUser);

module.exports = router;