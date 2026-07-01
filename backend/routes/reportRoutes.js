const express = require('express');
const router = express.Router();
const { createReport, getAllReports, getReportStats } = require('../controllers/reportController');
const { auth } = require('../middleware/authMiddleware');

router.use(auth);

router.post('/reports', createReport);
router.get('/reports', getAllReports);
router.get('/reports/stats', getReportStats);

module.exports = router;