const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Category.countDocuments();
        console.log(`Total Categories found: ${count}`);
        const sample = await Category.find().limit(5);
        console.log('Sample Categories:', sample.map(c => c.name));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
