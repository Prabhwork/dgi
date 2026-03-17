const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const MainCategory = require('./backend/models/MainCategory');
const Category = require('./backend/models/Category');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const mainCats = await MainCategory.find({});
        console.log('--- MAIN CATEGORIES ---');
        mainCats.forEach(c => console.log(`ID: ${c._id}, Name: ${c.name}`));

        const cats = await Category.find({});
        console.log('\n--- CATEGORIES ---');
        cats.forEach(c => console.log(`ID: ${c._id}, Name: ${c.name}`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
