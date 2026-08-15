const express = require('express');
const router = express.Router();
const { createDisasterRecord, getDisasterRecords, getDisasterRecordById, updateDisasterRecord, deleteDisasterRecord } = require('../controllers/disasterController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', getDisasterRecords);
router.get('/:id', getDisasterRecordById);
router.post('/', createDisasterRecord);
router.put('/:id', updateDisasterRecord);
router.delete('/:id', deleteDisasterRecord);

module.exports = router;
