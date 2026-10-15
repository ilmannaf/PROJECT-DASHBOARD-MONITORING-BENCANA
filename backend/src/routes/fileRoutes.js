const express = require('express');
const router = express.Router();
const { serveUpload } = require('../controllers/fileController');

router.get('/:filename', serveUpload);

module.exports = router;
