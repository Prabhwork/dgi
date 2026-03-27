const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encryptDeterministic, decryptDeterministic } = require('../utils/encryption');

const BusinessSchema = new mongoose.Schema({
    // Step 1: Basic Identity
    businessName: {
        type: String,
        required: [true, 'Please add a business name']
    },
    brandName: String,
    businessCategory: {
        type: String,
        required: [true, 'Please add a business category']
    },
    subcategory: [String],
    description: String,
    keywords: [String],

    // Step 2: Location & Contact
    gpsCoordinates: {
        lat: Number,
        lng: Number,
        address: String
    },
    registeredOfficeAddress: {
        type: String,
        required: [true, 'Please add a registered office address']
    },
    primaryContactNumber: {
        type: String,
        required: [true, 'Please add a primary contact number'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    officialWhatsAppNumber: String,
    officialEmailAddress: {
        type: String,
        required: [true, 'Please add an official email address'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },

    // Step 3: Operations & Status
    openingTime: String,
    closingTime: String,
    weeklyOff: {
        type: String,
        default: 'None'
    },
    businessHours: {
        monday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        tuesday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        wednesday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        thursday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        friday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        saturday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] },
        sunday: { isOpen: { type: Boolean, default: true }, slots: [{ open: String, close: String }] }
    },

    // Step 4: Verification & Trust
    aadhaarNumber: {
        type: String,
        set: encryptDeterministic,
        get: decryptDeterministic // Decrypts when retrieved from DB
        // Removed exact 12-digit match to allow 'XXXXXXXX1234' masking or encrypted strings
    },
    aadhaarCard: String, // file path for manual upload
    aadhaarVerified: {
        type: Boolean,
        default: false
    },
    website: String,
    ownerIdentityProof: String, // file path (PAN Card)
    establishmentProof: String, // file path (Partnership/GST/etc)

    // Step 5: Gallery & Catalog
    coverImage: String, // file path
    bannerImage: String, // file path
    gallery: [String], // array of file paths
    catalog: String, // file path (Pricing/Menu/Catalog)

    // Step 5.1: Services & Products
    services: [{
        name: String,
        description: String,
        price: Number,
        image: String // file path
    }],
    products: [{
        name: String,
        description: String,
        price: Number,
        image: String // file path
    }],

    // Step 6: Community & Tenders
    joinBulkBuying: {
        type: Boolean,
        default: false
    },
    joinFraudAlerts: {
        type: Boolean,
        default: false
    },

    // Administrative
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: String,
    emailVerificationOTPExpire: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    hasPendingChanges: {
        type: Boolean,
        default: false
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpire: {
        type: Date,
        select: false
    },
    // Payment specific fields
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amountPaid: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Encrypt password using bcrypt
BusinessSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
BusinessSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
BusinessSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Business', BusinessSchema);
