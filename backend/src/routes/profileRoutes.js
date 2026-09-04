const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getAllPetugasProfiles, getPetugasProfile } = require('../controllers/profileController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Semua endpoint butuh login
router.use(verifyToken);

// Petugas: profil sendiri
router.get('/me', getMyProfile);
router.put('/me', upload.single('photo'), updateMyProfile);

// Admin: profil semua petugas
router.get('/petugas', requireRole('admin'), getAllPetugasProfiles);
router.get('/petugas/:id', requireRole('admin'), getPetugasProfile);

module.exports = router;
