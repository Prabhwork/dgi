const mongoose = require('mongoose');

const DineoutSettingsSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        required: true,
        unique: true
    },
    isAcceptingBookings: {
        type: Boolean,
        default: true
    },
    // Available Time Slots (Deprecated: transitioned to lunchSlots/dinnerSlots)
    availableSlots: [{ type: String }],
    
    // Shift Specific Slots
    lunchSlots: [{ type: String }],
    dinnerSlots: [{ type: String }],
    // Shift Timings
    lunchOpening: { type: String, default: '11:00 AM' },
    lunchClosing: { type: String, default: '04:00 PM' },
    dinnerOpening: { type: String, default: '06:00 PM' },
    dinnerClosing: { type: String, default: '11:00 PM' },
    // Table Inventory (e.g., [{capacity: 4, count: 10}])
    tableInventory: [{
        capacity: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true
        }
    }],
    minGuestsPerBooking: {
        type: Number,
        default: 1
    },
    maxGuestsPerBooking: {
        type: Number,
        default: 20
    },
    autoConfirm: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('DineoutSettings', DineoutSettingsSchema);
