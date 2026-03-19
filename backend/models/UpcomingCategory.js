const mongoose = require('mongoose');

const upcomingCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title can not be more than 100 characters']
    },
    icon: {
        type: String,
        default: 'Rocket',
        trim: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category'
    },
    order: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('UpcomingCategory', upcomingCategorySchema);
