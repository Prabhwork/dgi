const mongoose = require('mongoose');

const EventBusinessSchema = new mongoose.Schema({
    // Basic Details
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    // Verification
    aadhaarNumber: { type: String, required: true },
    gstNumber: { type: String, required: true },
    registrationType: { type: String, required: true },

    // Business Profile
    category: { type: String, required: true },
    subCategory: { type: String },
    yearsOfOperation: { type: String },
    teamSize: { type: String },
    currentRevenue: { type: String },
    fundingRequired: { type: String, required: true },
    equityOffering: { type: String, required: true },

    // About
    aboutUs: { type: String, required: true },
    visionMission: { type: String },
    problemSolving: { type: String },

    // Media References (Paths)
    businessImages: { type: String }, // Path to uploaded file
    pitchDeck: { type: String },      // Path to uploaded PDF
    selfie: { type: String },         // Path to captured selfie image

    // Social Links
    website: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
    youtube: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventBusiness', EventBusinessSchema);
