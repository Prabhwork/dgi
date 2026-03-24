const mongoose = require('mongoose');

const mainSubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a main subcategory name'],
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },
    mainCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'MainCategory',
        required: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
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

module.exports = mongoose.model('MainSubcategory', mainSubcategorySchema);
