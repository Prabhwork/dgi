const express = require('express');
const { 
    register, 
    login, 
    getMe, 
    registerUser, 
    loginUser, 
    sendUserOTP, 
    verifyUserOTP, 
    googleLogin,
    completeProfile,
    updateMe,
    generate2FA,
    verifyAndEnable2FA,
    disable2FA,
    verify2FALogin,
    getAllUsers,
    updateUserStatus,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Admin Routes
router.post('/register', register);
router.post('/login', login);

// User Routes
router.post('/register-user', registerUser);
router.post('/login-user', loginUser);
router.post('/send-otp', sendUserOTP);
router.post('/verify-otp', verifyUserOTP);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/complete-profile', protect, completeProfile);
router.put('/update-me', protect, authorize('user'), updateMe);

// User 2FA Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify-enable', protect, verifyAndEnable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.post('/2fa/verify-login', verify2FALogin);

router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;
