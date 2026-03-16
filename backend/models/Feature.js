const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feature', featureSchema);
