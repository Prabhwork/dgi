const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Controllers
const businessController = require('../controllers/businessController');
const investorController = require('../controllers/investorController');
const contactController = require('../controllers/contactController');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// --- PUBLIC ROUTES ---

// Business Application
router.post('/business', upload.fields([
    { name: 'businessImages', maxCount: 1 },
    { name: 'pitchDeck', maxCount: 1 },
    { name: 'selfie', maxCount: 1 }
]), businessController.registerBusiness);

// Investor Registration
router.post('/investor', upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'documentUpload', maxCount: 1 }
]), investorController.registerInvestor);

// Contact Message
router.post('/contact', contactController.submitContact);

// --- ADMIN ROUTES ---

router.get('/admin/businesses', businessController.getBusinesses);
router.get('/admin/investors', investorController.getInvestors);
router.get('/admin/contacts', contactController.getContacts);

module.exports = router;
