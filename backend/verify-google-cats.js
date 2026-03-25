const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const GoogleCategory = require('./models/GoogleCategory');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const count = await GoogleCategory.countDocuments();
        console.log(`Total Google Categories found: ${count}`);
        
        const sample = await GoogleCategory.find().limit(5);
        console.log('Sample Categories:', sample.map(c => c.name));
        
        process.exit();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

check();
