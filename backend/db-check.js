const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MainCategory = require('./models/MainCategory');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/digital');
        console.log('Connected to DB');
        
        const count = await MainCategory.countDocuments();
        console.log(`MainCategory count: ${count}`);
        
        const all = await MainCategory.find();
        console.log('Sample data:', JSON.stringify(all.slice(0, 2), null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error('DB Check error:', err);
        process.exit(1);
    }
};

checkDB();
