const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const GoogleCategory = require('./models/GoogleCategory');

const testSearch = async (query) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const results = await GoogleCategory.find({
            name: { $regex: query, $options: 'i' }
        }).limit(5);
        
        console.log(`Results for "${query}":`);
        results.forEach(r => console.log(`- ${r.name}`));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testSearch('Auto');
