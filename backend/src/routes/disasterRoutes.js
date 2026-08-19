const express = require('express');
const router = express.Router();
const { createDisasterRecord, getDisasterRecords, getDisasterRecordById, updateDisasterRecord, deleteDisasterRecord, exportDisasterRecordPdf } = require('../controllers/disasterController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', getDisasterRecords);
router.get('/:id/pdf', exportDisasterRecordPdf);
router.get('/:id', getDisasterRecordById);
router.post('/', createDisasterRecord);
router.put('/:id', requireRole('admin'), updateDisasterRecord);
router.delete('/:id', requireRole('admin'), deleteDisasterRecord);

module.exports = router;
