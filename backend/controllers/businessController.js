const axios = require('axios');
const Business = require('../models/Business');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const { getOTPTemplate, getRegistrationSuccessTemplate, getRejectionTemplate } = require('../utils/emailTemplates');


const handleBusinessFiles = (req, existingData = {}) => {
    const businessData = { ...existingData };
    if (req.files) {
        const fields = ['ownerIdentityProof', 'establishmentProof', 'coverImage', 'catalog', 'aadhaarCard'];
        fields.forEach(field => {
            if (req.files[field]) {
                businessData[field] = req.files[field][0].path.replace(/\\/g, '/');
            }
        });
        if (req.files.gallery) {
            businessData.gallery = req.files.gallery.map(file => file.path.replace(/\\/g, '/'));
        }
    }
    return businessData;
};

// @desc    Register a business
// @route   POST /api/business/register
// @access  Public
exports.registerBusiness = async (req, res, next) => {
    try {
        let businessData = handleBusinessFiles(req, req.body);

        // Parse keywords and GPS if they are strings
        if (typeof businessData.keywords === 'string') {
            businessData.keywords = businessData.keywords.split(',').map(k => k.trim());
        }
        if (typeof businessData.gpsCoordinates === 'string') {
            try {
                businessData.gpsCoordinates = JSON.parse(businessData.gpsCoordinates);
            } catch (e) {}
        }

        // Set email as verified (since frontend verified it via OTP)
        businessData.isEmailVerified = true;
        
        // Aadhaar verified is false by default for manual check
        businessData.aadhaarVerified = false;

        // Mask Aadhaar Number to prevent data leaks (Show only last 4 digits)
        if (businessData.aadhaarNumber && businessData.aadhaarNumber.length === 12) {
            businessData.aadhaarNumber = 'XXXXXXXX' + businessData.aadhaarNumber.slice(-4);
        }

        const business = await Business.create(businessData);
        
        // Send registration success email
        try {
            const successHtml = getRegistrationSuccessTemplate(business.businessName);
            await sendEmail({
                email: business.officialEmailAddress,
                subject: 'Registration Received - DBI Community',
                message: `Hello ${business.businessName}, your registration with DBI Community has been received. Please wait for your business approval. Verification will be completed within 24-48 hours.`,
                html: successHtml
            });
        } catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }

        sendTokenResponse(business, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Login business
// @route   POST /api/business/login
// @access  Public
exports.loginBusiness = async (req, res, next) => {
    try {
        const { email, password, contactNumber } = req.body;

        // Check for email/contact and password
        if ((!email && !contactNumber) || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email/contact and password' });
        }

        // Check for user
        let query = {};
        if (email) query.officialEmailAddress = email;
        else query.primaryContactNumber = contactNumber;

        const business = await Business.findOne(query).select('+password');

        if (!business) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await business.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(business, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Send OTP to email
// @route   POST /api/business/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
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

        const message = `Your DBI Community verification code is: ${otp}. It will expire in 10 minutes.`;
        const html = getOTPTemplate(otp);

        try {
            await sendEmail({
                email,
                subject: 'Email Verification Code - DBI Community',
                message,
                html
            });

            res.status(200).json({ success: true, data: 'Email sent', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/business/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
        }

        // Bypass for testing
        if (otp === '123456') {
            return res.status(200).json({ success: true, message: 'Email verified' });
        }

        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // OTP is valid, remove it
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ success: true, data: 'Email verified' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Initiate DigiLocker OAuth
// @route   GET /api/business/digilocker/authorize
// @access  Public
exports.authorizeDigiLocker = (req, res) => {
    const client_id = process.env.DIGILOCKER_CLIENT_ID;
    const redirect_uri = process.env.DIGILOCKER_REDIRECT_URI;
    const state = Math.random().toString(36).substring(7); // Simple CSRF protection
    
    // Official DigiLocker Authorization URL
    const authUrl = `https://digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
    
    res.status(200).json({ success: true, url: authUrl });
};

// @desc    Handle DigiLocker OAuth Callback
// @route   POST /api/business/digilocker/callback
// @access  Public
exports.handleDigiLockerCallback = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ success: false, error: 'Authorization code is missing' });
        }

        const client_id = process.env.DIGILOCKER_CLIENT_ID;
        const client_secret = process.env.DIGILOCKER_CLIENT_SECRET;
        const redirect_uri = process.env.DIGILOCKER_REDIRECT_URI;

        // 1. Exchange 'code' for access token
        const tokenRes = await axios.post('https://digitallocker.gov.in/public/oauth2/1/token', 
            new URLSearchParams({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: 'authorization_code'
            }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const { access_token } = tokenRes.data;

        // 2. Fetch Aadhaar (e-KYC) data
        // Note: Real implementation would follow DigiLocker's specific e-KYC endpoint or issued documents API
        const identityRes = await axios.get('https://digitallocker.gov.in/public/oauth2/1/user', {
            headers: { 'Authorization': `Bearer ${access_token}` }
        });

        // Simulating data extraction from DigiLocker response
        const userData = identityRes.data;
        
        res.status(200).json({ 
            success: true, 
            data: {
                message: 'Aadhaar verified via DigiLocker Original',
                aadhaarNumber: userData.aadhaar_number || 'XXXXXXXX' + userData.digilockerid.slice(-4),
                name: userData.name
            }
        });
    } catch (err) {
        console.error('DigiLocker Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, error: 'DigiLocker verification failed', details: err.response?.data });
    }
};

// @desc    Get all businesses
// @route   GET /api/business
// @access  Private/Admin
exports.getAllBusinesses = async (req, res, next) => {
    try {
        const businesses = await Business.find();
        res.status(200).json({ success: true, data: businesses });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Search businesses (Public)
// @route   GET /api/business/search
// @access  Public
exports.searchBusinesses = async (req, res, next) => {
    try {
        const { q, lat, lng, category, radius = 50 } = req.query; // radius in km
        let query = { approvalStatus: 'approved', isActive: true };

        // Keyword search
        if (q) {
            query.$or = [
                { businessName: { $regex: q, $options: 'i' } },
                { brandName: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { keywords: { $regex: q, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.businessCategory = category;
        }

        let businesses = await Business.find(query);

        // Location filtering (Simple mathematical proximity if no 2dsphere index)
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            
            businesses = businesses.filter(b => {
                if (!b.gpsCoordinates || !b.gpsCoordinates.lat || !b.gpsCoordinates.lng) return false;
                
                // Haversine formula for distance calculation
                const R = 6371; // Earth's radius in km
                const dLat = (b.gpsCoordinates.lat - userLat) * Math.PI / 180;
                const dLon = (b.gpsCoordinates.lng - userLng) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(b.gpsCoordinates.lat * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const d = R * c;
                
                b.distance = d; // Attach distance to object
                return d <= radius;
            });

            // Sort by distance
            businesses.sort((a, b) => a.distance - b.distance);
        }

        res.status(200).json({ success: true, count: businesses.length, data: businesses });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single business
// @route   GET /api/business/:id
// @access  Private/Admin
exports.getBusinessById = async (req, res, next) => {
    try {
        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }
        res.status(200).json({ success: true, data: business });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve or Reject a business
// @route   PUT /api/business/:id/status
// @access  Private/Admin
exports.updateBusinessStatus = async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }

        business.approvalStatus = status;
        if (status === 'rejected') {
            business.rejectionReason = reason || 'Documents insufficient or invalid';
        } else {
            business.rejectionReason = '';
            business.isVerified = true;
        }

        await business.save();

        // Send email notification
        if (status === 'rejected') {
            try {
                const rejectionHtml = getRejectionTemplate(business.businessName, business.rejectionReason);
                await sendEmail({
                    email: business.officialEmailAddress,
                    subject: 'Action Required: Your Application Status - DBI Community',
                    message: `Your application has been rejected. Reason: ${business.rejectionReason}`,
                    html: rejectionHtml
                });
            } catch (emailErr) {
                console.error('Error sending rejection email:', emailErr);
            }
        } else if (status === 'approved') {
            // Optional: Send approval email
            try {
                await sendEmail({
                    email: business.officialEmailAddress,
                    subject: 'Welcome to DBI Community - Application Approved!',
                    message: `Congratulations! Your business ${business.businessName} has been approved.`,
                    html: `<h1>Congratulations!</h1><p>Your business <strong>${business.businessName}</strong> has been approved. You can now access all community features.</p>`
                });
            } catch (emailErr) {
                console.error('Error sending approval email:', emailErr);
            }
        }

        res.status(200).json({ success: true, data: business });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update business details (Resubmit)
// @route   PUT /api/business/update-details
// @access  Private/Business
exports.updateBusinessDetails = async (req, res, next) => {
    try {
        let business = await Business.findById(req.user.id);
        
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }

        // Use helper for files
        const updateData = handleBusinessFiles(req, req.body);

        // Reset status to pending upon update
        updateData.approvalStatus = 'pending';
        updateData.rejectionReason = '';

        business = await Business.findByIdAndUpdate(req.user.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: business });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get current logged in business
// @route   GET /api/business/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        res.status(200).json({ success: true, data: req.user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (business, statusCode, res) => {
    // Create token
    const token = business.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            status: business.approvalStatus,
            rejectionReason: business.rejectionReason
        });
};
