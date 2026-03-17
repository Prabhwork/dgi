const express = require('express');
const {
    registerBusiness,
    loginBusiness,
    getMe,
    sendOTP,
    verifyOTP,
    authorizeDigiLocker,
    handleDigiLockerCallback,
    getAllBusinesses,
    getBusinessById,
    updateBusinessStatus,
    updateBusinessDetails,
    searchBusinesses
} = require('../controllers/businessController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'ownerIdentityProof', maxCount: 1 },
    { name: 'establishmentProof', maxCount: 1 },
    { name: 'certifications', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'catalog', maxCount: 1 }
]);

router.post('/register', uploadFields, registerBusiness);
router.post('/login', loginBusiness);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/digilocker/authorize', authorizeDigiLocker);
router.post('/digilocker/callback', handleDigiLockerCallback);
router.get('/search', searchBusinesses);
router.get('/public/:id', getBusinessById); // Reusing getBusinessById since we can just use the same logic
router.get('/me', protect, getMe);

// Admin Routes
router.get('/', protect, authorize('admin'), getAllBusinesses);
router.get('/:id', protect, authorize('admin'), getBusinessById);
router.put('/:id/status', protect, authorize('admin'), updateBusinessStatus);

// Business Routes
router.put('/update-details', protect, authorize('business'), uploadFields, updateBusinessDetails);

module.exports = router;
