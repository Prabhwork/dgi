const mongoose = require('mongoose');

const EventInvestorSchema = new mongoose.Schema({
    // Basic Details
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

    // Verification
    aadhaarNumber: { type: String, required: true },
    gstNumber: { type: String },

    // Investment Profile
    investmentRange: { type: String, required: true },
    preferredCategories: [{ type: String }],
    preferredLocation: { type: String },
    investmentType: [{ type: String }],

    // Experience
    previousInvestments: { type: String },
    industryExperience: { type: String },
    portfolio: { type: String },

    // Availability
    availability: { type: String, enum: ['Active Investor', 'Passive Investor'], required: true },

    // Security
    selfie: { type: String },         // Path to captured selfie image
    documentUpload: { type: String }, // Path to document image

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventInvestor', EventInvestorSchema);
