const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const Business = require('../backend/models/Business');

const createTestBusiness = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Check if business exists
        const existing = await Business.findOne({ primaryContactNumber: '1234567890' });
        if (existing) {
            console.log('Test business already exists. Updating...');
            await Business.deleteOne({ _id: existing._id });
        }

        const businessData = {
            businessName: "Techentia Performance Tuning",
            brandName: "Techentia",
            businessCategory: "Tuning Automobile",
            subcategory: ["ECU Remapping", "Performance Upgrades", "Turbo Kits"],
            description: "Techentia is a leading automotive tuning center specializing in high-performance modifications and precision ECU remapping. We bring out the best in your vehicle.",
            keywords: ["tuning", "performance", "car", "fast", "engine"],
            gpsCoordinates: {
                lat: 28.6139,
                lng: 77.2090,
                address: "New Delhi, India"
            },
            registeredOfficeAddress: "Suite 500, Tech Plaza, New Delhi, 110001",
            primaryContactNumber: "1234567890",
            officialEmailAddress: "contact@techentia.test",
            password: "password123",
            weeklyOff: "Sunday",
            businessHours: {
                monday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                tuesday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                wednesday: { isOpen: true, slots: [{ open: "09:00", close: "20:00" }] },
                thursday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                friday: { isOpen: true, slots: [{ open: "09:00", close: "18:00" }] },
                saturday: { isOpen: true, slots: [{ open: "10:00", close: "16:00" }] },
                sunday: { isOpen: false, slots: [{ open: "09:00", close: "18:00" }] }
            },
            aadhaarNumber: "123456789012",
            isVerified: true,
            aadhaarVerified: true,
            approvalStatus: 'approved',
            isActive: true,
            isEmailVerified: true,
            paymentStatus: 'completed',
            amountPaid: 365,
            coverImage: "uploads/test-cover.jpg",
            bannerImage: "uploads/test-banner.jpg",
            gallery: ["uploads/test-gallery1.jpg", "uploads/test-gallery2.jpg"]
        };

        const business = await Business.create(businessData);
        console.log('Test Business Created successfully!');
        console.log('ID:', business._id);
        console.log('Email:', business.officialEmailAddress);
        console.log('Password: password123');

        process.exit();
    } catch (err) {
        console.error('Error creating test business:', err);
        process.exit(1);
    }
};

createTestBusiness();
