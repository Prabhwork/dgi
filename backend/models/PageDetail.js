const mongoose = require('mongoose');

const pageDetailSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category']
    },
    subcategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'Subcategory'
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
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

module.exports = mongoose.model('PageDetail', pageDetailSchema);
