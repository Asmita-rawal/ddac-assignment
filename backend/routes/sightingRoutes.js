const express = require('express');
const router = express.Router();
const { submitSighting, getSightingsByReport } = require('../controllers/sightingController');
const { auth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(auth);

router.post('/sightings', upload.single('image'), submitSighting);
router.get('/sightings/report/:reportId', getSightingsByReport);

module.exports = router;