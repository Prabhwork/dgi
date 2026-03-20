const Admin = require('../models/Admin');
const User = require('../models/User');
const Business = require('../models/Business');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');
const { getOTPTemplate, getUserNotificationTemplate, getResetOTPTemplate } = require('../utils/emailTemplates');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to check if email exists in any model
const checkEmailExists = async (email) => {
    const admin = await Admin.findOne({ email });
    const user = await User.findOne({ email });
    const business = await Business.findOne({ officialEmailAddress: email });
    return admin || user || business;
};

// @desc    Register user
// @route   POST /api/auth/register-user
// @access  Public
exports.registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if email already exists
        if (await checkEmailExists(email)) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Check if phone already exists
        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ success: false, error: 'Phone number already registered' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            isEmailVerified: false
        });

        // Send Welcome Email
        try {
            const welcomeMsg = `Welcome to the Digital Book of India! We're excited to have you on board. Explore verified businesses and grow your network with us.`;
            await sendEmail({
                email: user.email,
                subject: 'Welcome to DBI Community!',
                html: getUserNotificationTemplate(user.name, 'Welcome to DBI', welcomeMsg, '🎉', '#10b981')
            });
        } catch (mailErr) {
            console.error('Welcome email failed:', mailErr);
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login-user
// @access  Public
exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if user is suspended
        if (user.status === 'suspended') {
            return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (user.isTwoFactorEnabled) {
            const tempToken = jwt.sign({ id: user._id, pending2FA: true, role: 'user' }, process.env.JWT_SECRET, {
                expiresIn: '5m'
            });
            return res.status(200).json({ 
                success: true, 
                requires2fa: true,
                tempToken,
                message: '2FA verification required'
            });
        }

        sendTokenResponse(user, 200, res);

        // Send Login Notification
        try {
            const loginMsg = `Your account was just logged into from a new session.`;
            const metadata = {
                'Time': new Date().toLocaleString(),
                'IP Address': req.ip || 'Unknown',
                'Status': 'Successful'
            };
            const disclaimer = "If this wasn't you, please secure your account immediately or contact support. If it was you, you can safely ignore this email.";
            
            await sendEmail({
                email: user.email,
                subject: 'New Login Detected - DBI',
                html: getUserNotificationTemplate(user.name, 'New Login', loginMsg, '🔐', '#3b82f6', metadata, disclaimer)
            });
        } catch (mailErr) {
            console.error('Login notification failed:', mailErr);
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Google Login/Signup
// @route   POST /api/auth/google-login
// @access  Public
exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken, accessToken } = req.body;
        
        let googleId, email, name, picture;

        if (idToken) {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else if (accessToken) {
            // Fetch user info using access token
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
            const payload = await response.json();
            
            if (payload.error) {
                return res.status(400).json({ success: false, error: 'Invalid Google Access Token' });
            }

            googleId = payload.sub;
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
        } else {
            return res.status(400).json({ success: false, error: 'Google Token is required' });
        }

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user && user.status === 'suspended') {
            return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
        }

        if (!user) {
            // New user via Google login
            // Check if email exists in other models
            if (await checkEmailExists(email)) {
                return res.status(400).json({ success: false, error: 'Email already registered with another account type' });
            }

            // Return success with flag that profile is incomplete (needs phone)
            // But we can create a placeholder user first
            user = await User.create({
                name,
                email,
                googleId,
                isEmailVerified: true, // Google emails are verified
                phone: 'PENDING_' + googleId // Temporary phone until completed
            });

            // Send Welcome Email
            try {
                const welcomeMsg = "Welcome to the Digital Book of India! We're excited to have you on board via Google Login. Explore verified businesses and grow your network with us.";
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to DBI Community!',
                    html: getUserNotificationTemplate(user.name, 'Welcome to DBI', welcomeMsg, '🎉', '#10b981')
                });
            } catch (mailErr) {
                console.error('Google welcome email failed:', mailErr);
            }

            return res.status(201).json({
                success: true,
                token: user.getSignedJwtToken(),
                needsProfileCompletion: true,
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        }

        // Update googleId if not present (linked account)
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        if (user.phone && user.phone.startsWith('PENDING_')) {
            return res.status(200).json({
                success: true,
                token: user.getSignedJwtToken(),
                needsProfileCompletion: true,
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        }

        sendTokenResponse(user, 200, res);

        // Send Login Notification
        try {
            const loginMsg = `Your account was logged into via Google.`;
            const metadata = {
                'Method': 'Google OAuth',
                'Time': new Date().toLocaleString(),
                'IP Address': req.ip || 'Unknown'
            };
            const disclaimer = "If this wasn't you, please secure your account immediately. If it was you, please ignore this.";

            await sendEmail({
                email: user.email,
                subject: 'New Login Detected - DBI',
                html: getUserNotificationTemplate(user.name, 'New Login', loginMsg, '🔐', '#3b82f6', metadata, disclaimer)
            });
        } catch (mailErr) {
            console.error('Google login notification failed:', mailErr);
        }
    } catch (err) {
        res.status(400).json({ success: false, error: 'Google login failed: ' + err.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/update-me
// @access  Private
exports.updateMe = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            avatar: req.body.avatar
        };

        // Explicitly block email updates as per user request
        delete fieldsToUpdate.email;

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        // Send Profile Update Notification
        try {
            const updateMsg = `Specifically, your profile details (Name/Phone) were updated successfully on ${new Date().toLocaleString()}.`;
            await sendEmail({
                email: user.email,
                subject: 'Profile Updated - DBI',
                html: getUserNotificationTemplate(user.name, 'Profile Updated', updateMsg, '📝', '#f59e0b')
            });
        } catch (mailErr) {
            console.error('Profile update notification failed:', mailErr);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        let errorMessage = err.message;
        
        // Better error handling for duplicate phone number
        if (err.code === 11000) {
            if (err.keyPattern && err.keyPattern.phone) {
                errorMessage = 'This phone number is already registered with another account.';
            } else if (err.keyPattern && err.keyPattern.email) {
                errorMessage = 'This email is already in use.';
            } else {
                errorMessage = 'Duplicate field value entered.';
            }
        }

        res.status(400).json({ success: false, error: errorMessage });
    }
};

// @desc    Complete profile (Name and Mobile)
// @route   PUT /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ success: false, error: 'Please provide name and phone number' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.name = name;
        user.phone = phone;
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Send OTP to email for User
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendUserOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to temporary collection
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const html = getOTPTemplate(otp);

        await sendEmail({
            email,
            subject: 'Your Verification Code - DBI Community',
            message: `Your verification code is: ${otp}`,
            html
        });

        res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otp : undefined 
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify OTP for User
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyUserOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
        }

        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // OTP is valid, mark user as verified if they exist
        const user = await User.findOne({ email });
        if (user) {
            user.isEmailVerified = true;
            await user.save();
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Generate 2FA Secret and QR Code for User
// @route   POST /api/auth/2fa/generate
// @access  Private
exports.generate2FA = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const secret = speakeasy.generateSecret({
            name: `Digital Book Of India (${user.email})`
        });

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        res.status(200).json({
            success: true,
            secret: secret.base32,
            qrCodeUrl
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify and Enable 2FA for User
// @route   POST /api/auth/2fa/verify-enable
// @access  Private
exports.verifyAndEnable2FA = async (req, res, next) => {
    try {
        const { token, secret } = req.body;
        if (!token || !secret) return res.status(400).json({ success: false, error: 'Token and secret are required' });

        const isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token
        });

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
        }

        const user = await User.findByIdAndUpdate(req.user.id, {
            isTwoFactorEnabled: true,
            twoFactorSecret: secret
        }, { new: true });

        // Send 2FA Enabled Notification
        try {
            const faMsg = `Two-Factor Authentication (2FA) has been successfully enabled for your account. Your account is now more secure.`;
            await sendEmail({
                email: user.email,
                subject: '2FA Enabled - DBI',
                html: getUserNotificationTemplate(user.name, '2FA Enabled', faMsg, '🛡️', '#10b981')
            });
        } catch (mailErr) {
            console.error('2FA enabled notification failed:', mailErr);
        }

        res.status(200).json({ success: true, message: '2FA has been enabled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Disable 2FA for User
// @route   POST /api/auth/2fa/disable
// @access  Private
exports.disable2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

        const user = await User.findById(req.user.id).select('+twoFactorSecret');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA is not enabled' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
        }

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();

        // Send 2FA Disabled Notification
        try {
            const faMsg = `Two-Factor Authentication (2FA) has been disabled for your account. We recommend keeping it enabled for better security.`;
            await sendEmail({
                email: user.email,
                subject: '2FA Disabled - DBI',
                html: getUserNotificationTemplate(user.name, '2FA Disabled', faMsg, '⚠️', '#ef4444')
            });
        } catch (mailErr) {
            console.error('2FA disabled notification failed:', mailErr);
        }

        res.status(200).json({ success: true, message: '2FA has been disabled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify 2FA login step for User
// @route   POST /api/auth/2fa/verify-login
// @access  Public
exports.verify2FALogin = async (req, res, next) => {
    try {
        const { tempToken, token } = req.body;
        if (!tempToken || !token) return res.status(400).json({ success: false, error: 'Temp token and 2FA token are required' });

        // Verify temp token
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.pending2FA) {
            return res.status(400).json({ success: false, error: 'Invalid token type' });
        }

        const user = await User.findById(decoded.id).select('+twoFactorSecret');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA is not enabled for this account' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
        }

        // Issue actual login token
        sendTokenResponse(user, 200, res);

        // Send Login Notification (after 2FA)
        try {
            const loginMsg = `Your account was just logged into after 2FA verification.`;
            const metadata = {
                'Time': new Date().toLocaleString(),
                'IP Address': req.ip || 'Unknown',
                'Method': '2FA Verified'
            };
            const disclaimer = "If this wasn't you, please secure your account immediately. If it was you, please ignore this.";

            await sendEmail({
                email: user.email,
                subject: 'Successful Login - DBI',
                html: getUserNotificationTemplate(user.name, 'Successful Login', loginMsg, '🔐', '#3b82f6', metadata, disclaimer)
            });
        } catch (mailErr) {
            console.error('2FA login notification failed:', mailErr);
        }
    } catch (err) {
        res.status(401).json({ success: false, error: 'Token is invalid or expired' });
    }
};

// @desc    Register admin
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if email already exists
        if (await checkEmailExists(email)) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        // Create admin
        const admin = await Admin.create({
            email,
            password
        });

        sendTokenResponse(admin, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        // Check for admin
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(admin, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in user/admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


// @desc    Suspend/Activate User (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const { status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        user.status = status;
        await user.save();

        // Send Account Status Notification
        try {
            const title = status === 'suspended' ? 'Account Suspended' : 'Account Re-activated';
            const icon = status === 'suspended' ? '🚫' : '✅';
            const color = status === 'suspended' ? '#ef4444' : '#10b981';
            const msg = status === 'suspended' 
                ? 'Your account has been suspended by the administrator. Please contact our support team for more information.' 
                : 'Your account has been re-activated by the administrator. You can now log in and access your profile.';

            await sendEmail({
                email: user.email,
                subject: `${title} - DBI`,
                html: getUserNotificationTemplate(user.name, title, msg, icon, color)
            });
        } catch (mailErr) {
            console.error('Account status notification failed:', mailErr);
        }

        res.status(200).json({
            success: true,
            message: `User account has been ${status}`,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};


const sendTokenResponse = (model, statusCode, res) => {
  
    const token = model.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token
    });
};
// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email address' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'No user found with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to temporary collection
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send Email using premium template
        try {
            const html = getResetOTPTemplate(user.name, otp);

            await sendEmail({
                email,
                subject: 'Password Reset OTP - DBI',
                html
            });
        } catch (mailErr) {
            console.error('Forgot password email failed:', mailErr);
        }

        res.status(200).json({ success: true, message: 'Reset OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update password (pre-save hook will hash it)
        user.password = password;
        await user.save();

        // Remove OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Send confirmation email
        try {
            const successMsg = "Your account password has been successfully reset. You can now access your profile.";
            const html = getUserNotificationTemplate(
                user.name,
                'Password Reset Success',
                successMsg,
                '✅',
                '#10b981'
            );

            await sendEmail({
                email,
                subject: 'Password Reset Successful - DBI',
                html
            });
        } catch (mailErr) {
            console.error('Reset confirmation email failed:', mailErr);
        }

        // Return token for auto-login
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.status(200).json({ 
            success: true, 
            message: 'Password reset successful.',
            token 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
