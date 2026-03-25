const axios = require('axios');
const Razorpay = require('razorpay');
const Business = require('../models/Business');
const Claim = require('../models/Claim');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const { getOTPTemplate, getRegistrationSuccessTemplate, getRejectionTemplate, getUserNotificationTemplate, getResetOTPTemplate } = require('../utils/emailTemplates');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const MainCategory = require('../models/MainCategory');
const MainSubcategory = require('../models/MainSubcategory');

const handleBusinessFiles = (req, existingData = {}) => {
    const businessData = { ...existingData };
    if (req.files) {
        const fields = ['ownerIdentityProof', 'establishmentProof', 'coverImage', 'bannerImage', 'catalog', 'aadhaarCard'];
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

const User = require('../models/User');

// @desc    Register a business
// @route   POST /api/business/register
// @access  Public
exports.registerBusiness = async (req, res, next) => {
    try {
        const { officialEmailAddress } = req.body;

        // Check if email already exists in User model
        const userExists = await User.findOne({ email: officialEmailAddress });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Email already registered as a regular user' });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Payment details are required to register.' });
        }

        const crypto = require('crypto');
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid Payment Signature' });
        }

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
        businessData.aadhaarVerified = false;
        
        // Save payment status directly as completed
        businessData.paymentStatus = 'completed';
        businessData.amountPaid = 365;
        businessData.razorpayOrderId = razorpay_order_id;
        businessData.razorpayPaymentId = razorpay_payment_id;
        businessData.razorpaySignature = razorpay_signature;

        // Handle Custom Categories/Subcategories
        let { businessCategory, subcategory, isCustomCategory, customCategory, isCustomSubcategory, customSubcategory } = req.body;

        // Ensure subcategory is an array
        if (typeof businessData.subcategory === 'string') {
            try {
                businessData.subcategory = JSON.parse(businessData.subcategory);
            } catch (e) {
                businessData.subcategory = businessData.subcategory.split(',').map(s => s.trim()).filter(s => s);
            }
        } else if (!Array.isArray(businessData.subcategory)) {
            businessData.subcategory = businessData.subcategory ? [businessData.subcategory] : [];
        }

        if (isCustomCategory === 'true' || isCustomCategory === true) {
            let cat = await MainCategory.findOne({ name: customCategory });
            if (!cat) {
                cat = await MainCategory.create({ name: customCategory });
            }
            businessData.businessCategory = cat.name;
        }

        if (isCustomSubcategory === 'true' || isCustomSubcategory === true) {
            const catName = businessData.businessCategory || businessCategory;
            const cat = await MainCategory.findOne({ name: catName });
            if (cat) {
                let sub = await MainSubcategory.findOne({ name: customSubcategory, mainCategory: cat._id });
                if (!sub) {
                    sub = await MainSubcategory.create({ name: customSubcategory, mainCategory: cat._id });
                }
                // Add the custom subcategory to the array if not already present
                if (!businessData.subcategory.includes(sub.name)) {
                    businessData.subcategory.push(sub.name);
                }
            }
        }

        // Explicitly set as pending for initial review
        businessData.approvalStatus = 'pending';
        businessData.rejectionReason = '';
        businessData.isVerified = false;

        const business = await Business.create(businessData);
        
        // Send registration success email
        try {
            const successHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #10b981; text-align: center;">Payment Successful & Registration Received! 🎉</h2>
                    <p>Dear <strong>${business.businessName}</strong>,</p>
                    <p>Thank you for registering with the Digital Book of India community. We have successfully received your payment of <strong>₹365</strong>.</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #374151;">Transaction Details:</h3>
                        <p style="margin: 5px 0;"><strong>Amount:</strong> ₹365</p>
                        <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${razorpay_order_id}</p>
                    </div>

                    <p><strong>Next Steps:</strong></p>
                    <p>Our team will manually verify your Aadhaar card and other uploaded documents. This process typically takes 24-48 hours. Once approved, your listing will go live.</p>
                    
                    <p>In the meantime, you can log in to your account using the credentials you provided to check your current status.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/community/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
                        If you have any questions, please reply to this email.
                    </p>
                </div>
            `;
            await sendEmail({
                email: business.officialEmailAddress,
                subject: 'Payment Successful - Welcome to DBI Community',
                html: successHtml
            });
        } catch (emailErr) {
            console.error('Error sending welcome email:', emailErr);
        }

        res.status(201).json({
            success: true,
            message: "Payment verified and registration complete"
        });
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

        if (business.isTwoFactorEnabled) {
            // Setup a temporary token for 2FA validation
            const tempToken = jwt.sign({ id: business._id, pending2FA: true }, process.env.JWT_SECRET, {
                expiresIn: '5m'
            });
            return res.status(200).json({ 
                success: true, 
                requires2fa: true,
                tempToken,
                message: '2FA verification required'
            });
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

        // Check if email already exists in User model
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Email already registered as a regular user' });
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

        // Send email in background - Don't await it to ensure instant API response
        sendEmail({
            email,
            subject: 'Email Verification Code - DBI Community',
            message,
            html
        }).catch(err => {
            console.error('Background Email Dispatch Failed:', err);
        });

        // Respond instantly
        res.status(200).json({ 
            success: true, 
            data: 'OTP triggered', 
            otp: process.env.NODE_ENV === 'development' ? otp : undefined 
        });
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
        const businesses = await Business.find().lean();
        
        // Fetch all claims and map them to businesses
        const allClaims = await Claim.find().lean();
        
        const businessesWithClaims = businesses.map(business => ({
            ...business,
            claims: allClaims.filter(claim => claim.businessId.toString() === business._id.toString())
        }));

        res.status(200).json({ success: true, data: businessesWithClaims });
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
                { keywords: { $regex: q, $options: 'i' } },
                { subcategory: { $regex: q, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            query.businessCategory = category;
        }

        let businesses = await Business.find(query).lean();

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
                
                b.distanceKm = d; // Return raw straight-line distance for backend
                return d <= radius;
            });

            // Sort by distance
            businesses.sort((a, b) => a.distanceKm - b.distanceKm);
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

        // Approval check for public route access (identified by lack of auth/admin context or specific path)
        // If the request URL contains '/public/', we enforce the check.
        if (req.originalUrl.includes('/public/') && business.approvalStatus !== 'approved') {
            return res.status(403).json({ success: false, error: 'Business profile is pending approval and currently not visible.' });
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
            business.hasPendingChanges = false; // Clear flag once admin has reviewed & approved
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

// @desc    Get all transactions (Admin only)
// @route   GET /api/business/transactions
// @access  Private/Admin
exports.getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Business.find({ paymentStatus: 'completed' })
            .select('businessName officialEmailAddress primaryContactNumber amountPaid paymentStatus razorpayPaymentId razorpayOrderId razorpaySignature createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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

        // Parse services and map files
        if (updateData.servicesData) {
            try {
                const services = JSON.parse(updateData.servicesData);
                if (req.files && req.files.serviceImages) {
                    let fileIndex = 0;
                    services.forEach((service) => {
                        if (service.image === `new_file_${fileIndex}` && fileIndex < req.files.serviceImages.length) {
                            service.image = req.files.serviceImages[fileIndex].path.replace(/\\/g, '/');
                            fileIndex++;
                        }
                    });
                }
                updateData.services = services.slice(0, 10);
            } catch (e) {
                console.error("Failed to parse servicesData", e);
            }
        }

        // Parse products and map files
        if (updateData.productsData) {
            try {
                const products = JSON.parse(updateData.productsData);
                if (req.files && req.files.productImages) {
                    let fileIndex = 0;
                    products.forEach((product) => {
                        if (product.image === `new_file_${fileIndex}` && fileIndex < req.files.productImages.length) {
                            product.image = req.files.productImages[fileIndex].path.replace(/\\/g, '/');
                            fileIndex++;
                        }
                    });
                }
                updateData.products = products.slice(0, 10);
            } catch (e) {
                console.error("Failed to parse productsData", e);
            }
        }

        // If already approved, keep approved so listing stays visible on frontend.
        // We no longer set hasPendingChanges = true because the user wants updates to be automatic.
        if (business.approvalStatus !== 'approved') {
            // Was pending or rejected — reset to pending for fresh admin review
            updateData.approvalStatus = 'pending';
            updateData.rejectionReason = '';
        }

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

// @desc    Get nearby businesses using gpsCoordinates
// @route   GET /api/business/nearby?lat=xx&lng=xx&radius=5000
// @access  Public
exports.getNearbyBusinesses = async (req, res, next) => {
    try {
        const { lat, lng, radius = 5000000, category, minRating } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({ success: false, error: 'Please provide lat and lng' });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const radiusKm = parseFloat(radius) / 1000;

        // Rough bounding box (~1 degree = 111km)
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(userLat * Math.PI / 180));

        let query = {
            approvalStatus: 'approved',
            isActive: true,
            'gpsCoordinates.lat': { $gte: userLat - latDelta, $lte: userLat + latDelta },
            'gpsCoordinates.lng': { $gte: userLng - lngDelta, $lte: userLng + lngDelta }
        };

        if (category) query.businessCategory = new RegExp(category, 'i');

        let businesses = await Business.find(query)
            .select('businessName brandName businessCategory description registeredOfficeAddress gpsCoordinates primaryContactNumber officialWhatsAppNumber website openingTime closingTime coverImage aadhaarVerified approvalStatus')
            .limit(200);

        // Calculate exact distance and filter
        const toRad = (deg) => deg * Math.PI / 180;
        const getDistanceKm = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        businesses = businesses
            .filter(b => b.gpsCoordinates && b.gpsCoordinates.lat && b.gpsCoordinates.lng)
            .map(b => ({
                ...b.toObject(),
                distanceKm: getDistanceKm(userLat, userLng, b.gpsCoordinates.lat, b.gpsCoordinates.lng)
            }))
            .filter(b => b.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);

        res.status(200).json({ success: true, count: businesses.length, data: businesses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
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

// @desc    Generate 2FA Secret and QR Code
// @route   POST /api/business/2fa/generate
// @access  Private
exports.generate2FA = async (req, res, next) => {
    try {
        const business = await Business.findById(req.user.id);
        if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

        const secret = speakeasy.generateSecret({
            name: `Digital Book Of India (${business.officialEmailAddress})`
        });

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        // We do temporarily send the secret back because the user needs to save it before verifying
        // We will only save it to DB once they verify it successfully in the next step
        res.status(200).json({
            success: true,
            secret: secret.base32,
            qrCodeUrl
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify and Enable 2FA
// @route   POST /api/business/2fa/verify-enable
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

        await Business.findByIdAndUpdate(req.user.id, {
            isTwoFactorEnabled: true,
            twoFactorSecret: secret
        });

        res.status(200).json({ success: true, message: '2FA has been enabled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Disable 2FA
// @route   POST /api/business/2fa/disable
// @access  Private
exports.disable2FA = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, error: 'Token is required' });

        const business = await Business.findById(req.user.id).select('+twoFactorSecret');
        if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

        if (!business.isTwoFactorEnabled || !business.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA is not enabled' });
        }

        const isValid = speakeasy.totp.verify({
            secret: business.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
        }

        business.isTwoFactorEnabled = false;
        business.twoFactorSecret = undefined;
        await business.save();

        res.status(200).json({ success: true, message: '2FA has been disabled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify 2FA login step
// @route   POST /api/business/2fa/verify-login
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

        const business = await Business.findById(decoded.id).select('+twoFactorSecret');
        if (!business) return res.status(404).json({ success: false, error: 'Business not found' });

        if (!business.isTwoFactorEnabled || !business.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA is not enabled for this account' });
        }

        const isValid = speakeasy.totp.verify({
            secret: business.twoFactorSecret,
            encoding: 'base32',
            token: token
        });

        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Invalid 2FA token' });
        }

        // Issue actual login token
        sendTokenResponse(business, 200, res);
    } catch (err) {
        res.status(401).json({ success: false, error: 'Token is invalid or expired' });
    }
};
// @desc    Forgot Password - Send OTP
// @route   POST /api/business/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Please provide an email address' });
        }

        const business = await Business.findOne({ officialEmailAddress: email });
        if (!business) {
            return res.status(404).json({ success: false, error: 'No business found with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to temporary collection
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send Email
        try {
            const html = getResetOTPTemplate(business.businessName, otp);

            await sendEmail({
                email,
                subject: 'Password Reset OTP - DBI Community',
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
// @route   POST /api/business/reset-password
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

        const business = await Business.findOne({ officialEmailAddress: email });
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }

        // Update password (pre-save hook will hash it)
        business.password = password;
        await business.save();

        // Remove OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Send confirmation email
        try {
            const successMsg = "Your business account password has been successfully reset. You have been automatically logged in.";
            const html = getUserNotificationTemplate(
                business.businessName,
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

        res.status(200).json({ 
            success: true, 
            message: 'Password reset successful.',
            token: business.getSignedJwtToken()
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Search Suggestions
// @route   GET /api/business/suggestions
// @access  Public
const categoryKeywords = {
    "Shopping": ["Wholesale", "Retail", "Best Prices", "Latest Collection", "Discount Store", "Imported Goods", "Trusted Seller", "Fast Delivery", "Bulk Buying", "Quality Products"],
    "Food & Beverage": ["Home Delivery", "Pure Veg", "Non-Veg", "Party Orders", "Authentic Taste", "Best in Town", "Fresh Ingredients", "Healthy Food", "Quick Bite", "Dine In"],
    "Real Estate": ["Plots", "Flats", "Commercial Space", "Low Budget", "Prime Location", "Brokerage Free", "Verified Property", "Rental", "Ready to Move", "Investment"],
    "Automobile": ["Best Service", "Genuine Parts", "Car Wash", "Second Hand", "Expert Mechanics", "Quick Repair", "Insurance Claim", "Tyre Shop", "Engine Work", "Detailing"],
    "Beauty & Wellness": ["Unisex Salon", "Bridal Makeup", "Organic Products", "Skin Care", "Affordable Packages", "Certified Experts", "Spa", "Hair Cut", "Weight Loss", "Yoga"],
    "Education": ["Best Coaching", "Home Tutors", "Competitive Exams", "Skill Development", "Career Counseling", "Online Classes", "Computer Course", "Language Classes", "School", "Academy"],
    "Healthcare": ["Top Doctors", "24/7 Pharmacy", "Diagnostic Lab", "Emergency Care", "Specialized Clinic", "Trustworthy Care", "Home Health", "Dental Care", "Optician", "Wellness"],
    "Religious Organizations": ["Worship", "Prayer", "Meditation", "Temple", "Church", "Mosque", "Gurudwara", "Spiritual", "Community", "Divine", "Blessings", "Satsang", "Peace", "Charity"],
    "Professional Services": ["Legal Advice", "CA Services", "Tax Consultation", "IT Support", "Design Agency", "Marketing", "Consultancy", "Documentation", "Insurance Agent", "Courier"],
    "Travel & Tourism": ["Tour Packages", "Hotel Booking", "Flight Tickets", "Taxi Service", "Car Rental", "Visa Service", "Local Tour", "Adventure", "Pilgrimage", "HoneyMoon"],
    "Spiritual Centers": ["Yoga", "Mindfulness", "Healing", "Retreat", "Soul", "Enlightenment", "Guru", "Inner Peace", "Reiki", "Chakra Balancing"]
};

const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Jabalpur", "Gwalior"
];

exports.getSearchSuggestions = async (req, res, next) => {
    try {
        const { q, category, subcategory, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const maxLimit = parseInt(limit);
        
        const lookupKeys = [];
        if (category) lookupKeys.push(category);
        if (subcategory) lookupKeys.push(subcategory);

        let allPotentialSuggestions = [];

        // 1. Contextual Keywords (Highest Priority)
        let recommendedKeywords = new Set();
        lookupKeys.forEach(key => {
            if (categoryKeywords[key]) {
                categoryKeywords[key].forEach(k => recommendedKeywords.add(k));
            }
        });

        // 2. Add Places (Locations) - Related to Indian Cities
        const placeSuggestions = indianCities.map(city => `${city}`);

        // 3. Filter and Combine based on query 'q'
        if (!q || q.length < 1) {
            // If focused but no text, show all recommended keywords + some cities
            allPotentialSuggestions = [
                ...Array.from(recommendedKeywords).map(k => ({ text: k, type: 'recommended' })),
                ...placeSuggestions.slice(0, 10).map(p => ({ text: p, type: 'place' }))
            ];
        } else {
            const query = q.toLowerCase();
            
            // Filter keywords by query
            const filteredKeywords = Array.from(recommendedKeywords)
                .filter(k => k.toLowerCase().includes(query))
                .map(k => ({ text: k, type: 'keyword' }));

            // Filter places by query
            const filteredPlaces = placeSuggestions
                .filter(p => p.toLowerCase().includes(query))
                .map(p => ({ text: p, type: 'place' }));

            // Find database matches (Businesses, Categories, Subcategories)
            const regex = new RegExp(q, 'i');
            const [businesses, mainCats, subCats] = await Promise.all([
                Business.find({ businessName: regex, approvalStatus: 'approved' }).limit(10).select('businessName'),
                MainCategory.find({ name: regex }).limit(10).select('name'),
                MainSubcategory.find({ name: regex }).limit(10).select('name')
            ]);

            allPotentialSuggestions = [
                ...filteredKeywords,
                ...filteredPlaces,
                ...mainCats.map(c => ({ text: c.name, type: 'category' })),
                ...subCats.map(s => ({ text: s.name, type: 'subcategory' })),
                ...businesses.map(b => ({ text: b.businessName, type: 'business' }))
            ];
        }

        // Apply Pagination
        const paginatedData = allPotentialSuggestions.slice(skip, skip + maxLimit);
        const hasMore = allPotentialSuggestions.length > (skip + maxLimit);

        res.status(200).json({ 
            success: true, 
            data: paginatedData,
            hasMore,
            total: allPotentialSuggestions.length
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
