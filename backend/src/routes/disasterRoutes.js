const express = require('express');
const router = express.Router();
const { createDisasterRecord, getDisasterRecords, getDisasterRecordById, updateDisasterRecord, deleteDisasterRecord, exportDisasterRecordPdf, exportDisasterRecordsExcel } = require('../controllers/disasterController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken);

router.get('/', getDisasterRecords);
router.get('/export', exportDisasterRecordsExcel);
router.get('/:id/pdf', exportDisasterRecordPdf);
router.get('/:id', getDisasterRecordById);
router.post('/', upload.array('photos', 5), createDisasterRecord);
router.put('/:id', requireRole('admin'), upload.array('photos', 5), updateDisasterRecord);
router.delete('/:id', requireRole('admin'), deleteDisasterRecord);

module.exports = router;
