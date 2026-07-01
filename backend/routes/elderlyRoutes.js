const express = require('express');
const router = express.Router();
const { 
    addElderly, 
    getAllElderly, 
    getElderlyById, 
    updateElderly, 
    deleteElderly 
} = require('../controllers/elderlyController');
const { auth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(auth);

// CRUD routes
router.post('/elderly', upload.single('profile_image'), addElderly);
router.get('/elderly', getAllElderly);
router.get('/elderly/:id', getElderlyById);
router.put('/elderly/:id', upload.single('profile_image'), updateElderly);
router.delete('/elderly/:id', deleteElderly);

module.exports = router;