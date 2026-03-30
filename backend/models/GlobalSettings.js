const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    liveListingBase: {
        type: Number,
        default: 3842
    },
    liveListingCurrent: {
        type: Number,
        default: 3842
    },
    liveListingMinIncrement: {
        type: Number,
        default: 1
    },
    liveListingMaxIncrement: {
        type: Number,
        default: 4
    },
    liveListingMinInterval: {
        type: Number,
        default: 2000 // ms
    },
    liveListingMaxInterval: {
        type: Number,
        default: 5000 // ms
    },
    liveListingStartTime: {
        type: Number,
        default: 10 // 10 AM
    },
    liveListingEndTime: {
        type: Number,
        default: 19 // 7 PM
    },
    liveListingEnabled: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
