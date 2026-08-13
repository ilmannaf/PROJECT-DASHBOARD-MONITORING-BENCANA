const express = require('express');
const router = express.Router();
const { createActivity, getActivities, updateActivity, deleteActivity } = require('../controllers/activityController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken); // semua endpoint activities butuh login

router.post('/', upload.single('documentation'), createActivity);
router.get('/', getActivities);
router.patch('/:id', upload.single('documentation'), updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;