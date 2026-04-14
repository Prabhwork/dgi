const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    pin: {
        type: String,
        select: false // Secure by default
    },
    isPinSet: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'locked'],
        default: 'active'
    },
    resetPinOTP: {
        type: String,
        select: false
    },
    resetPinOTPExpire: {
        type: Date,
        select: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
