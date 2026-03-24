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
    searchBusinesses,
    generate2FA,
    verifyAndEnable2FA,
    disable2FA,
    verify2FALogin,
    getNearbyBusinesses,
    getAllTransactions,
    forgotPassword,
    resetPassword,
    getSearchSuggestions
} = require('../controllers/businessController');
const {
    submitClaim,
    getClaims,
    updateClaimStatus
} = require('../controllers/claimController');
const { createRegistrationOrder } = require('../controllers/paymentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');



const uploadFields = upload.fields([
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'ownerIdentityProof', maxCount: 1 },
    { name: 'establishmentProof', maxCount: 1 },
    { name: 'certifications', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'catalog', maxCount: 1 },
    { name: 'serviceImages', maxCount: 10 },
    { name: 'productImages', maxCount: 10 },
    { name: 'ownerProof', maxCount: 1 }
]);

router.post('/register', uploadFields, registerBusiness);
router.post('/create-payment-order', createRegistrationOrder);
router.post('/login', loginBusiness);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/digilocker/authorize', authorizeDigiLocker);
router.post('/digilocker/callback', handleDigiLockerCallback);
router.get('/search', searchBusinesses);
router.get('/suggestions', getSearchSuggestions);
router.get('/nearby', getNearbyBusinesses);
router.get('/public/:id', getBusinessById); // Reusing getBusinessById since we can just use the same logic
router.post('/claim/:id', uploadFields, submitClaim);
router.get('/me', protect, getMe);

// Admin Routes
router.get('/', protect, authorize('admin'), getAllBusinesses);
router.get('/:id', protect, authorize('admin'), getBusinessById);
router.get('/transactions', protect, authorize('admin'), getAllTransactions);
router.put('/:id/status', protect, authorize('admin'), updateBusinessStatus);
router.get('/claims/all', protect, authorize('admin'), getClaims);
router.put('/claims/:id', protect, authorize('admin'), updateClaimStatus);

// Business Routes
router.put('/update-details', protect, authorize('business'), uploadFields, updateBusinessDetails);

// 2FA Routes
router.post('/2fa/generate', protect, authorize('business'), generate2FA);
router.post('/2fa/verify-enable', protect, authorize('business'), verifyAndEnable2FA);
router.post('/2fa/disable', protect, authorize('business'), disable2FA);
router.post('/2fa/verify-login', verify2FALogin);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
