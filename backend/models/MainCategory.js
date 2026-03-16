const mongoose = require('mongoose');

const mainCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a main category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
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

module.exports = mongoose.model('MainCategory', mainCategorySchema);
