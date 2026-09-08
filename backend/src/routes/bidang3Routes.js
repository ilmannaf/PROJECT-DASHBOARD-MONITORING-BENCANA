const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  // Air Bersih
  createAirBersihProposal,
  getAirBersihProposals,
  getAirBersihProposalById,
  updateAirBersihStatus,
  deleteAirBersihProposal,
  // Bansos
  createBansosProposal,
  getBansosProposals,
  getBansosProposalById,
  updateBansosStatus,
  deleteBansosProposal,
  // Infrastruktur
  createInfrastrukturProposal,
  getInfrastrukturProposals,
  getInfrastrukturProposalById,
  updateInfrastrukturStatus,
  deleteInfrastrukturProposal,
  // Survey
  createSurvey,
  updateSurvey,
  getSurveys,
  // Stats
  getBidang3Stats
} = require('../controllers/bidang3Controller');

// ========================================
// AIR BERSIH
// ========================================
router.get('/air-bersih', verifyToken, getAirBersihProposals);
router.get('/air-bersih/:id', verifyToken, getAirBersihProposalById);
router.post('/air-bersih', verifyToken, requireRole('admin'), createAirBersihProposal);
router.patch('/air-bersih/:id/status', verifyToken, requireRole('admin'), updateAirBersihStatus);
router.delete('/air-bersih/:id', verifyToken, requireRole('admin'), deleteAirBersihProposal);

// ========================================
// BANSOS
// ========================================
router.get('/bansos', verifyToken, getBansosProposals);
router.get('/bansos/:id', verifyToken, getBansosProposalById);
router.post('/bansos', verifyToken, requireRole('admin'), upload.single('surat_pengajuan'), createBansosProposal);
router.patch('/bansos/:id/status', verifyToken, requireRole('admin'), updateBansosStatus);
router.delete('/bansos/:id', verifyToken, requireRole('admin'), deleteBansosProposal);

// ========================================
// INFRASTRUKTUR
// ========================================
router.get('/infrastruktur', verifyToken, getInfrastrukturProposals);
router.get('/infrastruktur/:id', verifyToken, getInfrastrukturProposalById);
router.post('/infrastruktur', verifyToken, requireRole('admin'), createInfrastrukturProposal);
router.patch('/infrastruktur/:id/status', verifyToken, requireRole('admin'), updateInfrastrukturStatus);
router.delete('/infrastruktur/:id', verifyToken, requireRole('admin'), deleteInfrastrukturProposal);

// ========================================
// SURVEY
// ========================================
router.get('/surveys', verifyToken, getSurveys);
router.post('/surveys', verifyToken, requireRole('admin'), upload.fields([
  { name: 'surat_tugas', maxCount: 1 },
  { name: 'form_survey', maxCount: 1 }
]), createSurvey);
router.patch('/surveys/:id', verifyToken, requireRole('admin'), upload.single('foto_dokumentasi'), updateSurvey);

// ========================================
// STATISTIK
// ========================================
router.get('/stats', verifyToken, getBidang3Stats);

module.exports = router;
