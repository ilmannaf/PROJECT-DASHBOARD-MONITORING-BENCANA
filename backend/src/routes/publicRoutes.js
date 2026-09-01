const express = require('express');
const router = express.Router();
const { getPublicStats, getPublicMonthlyStats, getPublicMonthlyByType } = require('../controllers/publicStatsController');

router.get('/stats', getPublicStats);
router.get('/stats/monthly', getPublicMonthlyStats);
router.get('/stats/monthly/by-type', getPublicMonthlyByType);

module.exports = router;
