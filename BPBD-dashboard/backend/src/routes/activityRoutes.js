const express = require('express');
const router = express.Router();
const { createActivity, getActivities, updateActivity, deleteActivity } = require('../controllers/activityController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken); // semua endpoint activities butuh login

router.post('/', requireRole('admin'), upload.single('documentation'), createActivity);
router.get('/', getActivities);
router.patch('/:id', requireRole('admin'), upload.single('documentation'), updateActivity);
router.delete('/:id', requireRole('admin'), deleteActivity);

module.exports = router;