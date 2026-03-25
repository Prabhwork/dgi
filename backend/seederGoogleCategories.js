const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const GoogleCategory = require('./models/GoogleCategory');

// Load env vars
dotenv.config();

const parseCategories = () => {
    try {
        const filePath = path.join(__dirname, 'categories.txt');
        if (!fs.existsSync(filePath)) {
            console.error('categories.txt not found at:', filePath);
            return [];
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        let categories = [];

        lines.forEach(line => {
            const parts = line.split(/\s{2,}/);
            parts.forEach(part => {
                const trimmed = part.trim();
                if (trimmed && 
                    trimmed !== 'Google My Business Category' && 
                    trimmed !== 'Page' &&
                    !/^\d+$/.test(trimmed)
                ) {
                    categories.push(trimmed);
                }
            });
        });

        // De-duplicate
        const uniqueCategories = [...new Set(categories)];
        return uniqueCategories;
    } catch (err) {
        console.error('Error parsing categories:', err);
        return [];
    }
};

const importData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully!');

        const categoriesList = parseCategories();
        console.log(`Parsed ${categoriesList.length} unique categories.`);
        
        if (categoriesList.length === 0) {
            console.log('No categories to import.');
            process.exit();
        }

        console.log('Clearing existing Google Categories...');
        await GoogleCategory.deleteMany({});
        console.log('Cleared existing Google Categories.');

        const docs = categoriesList.map(cat => ({
            name: cat,
            isActive: true
        }));

        console.log('Starting bulk injection...');
        // Insert in batches of 500 to be safe
        const batchSize = 500;
        for (let i = 0; i < docs.length; i += batchSize) {
            const batch = docs.slice(i, i + batchSize);
            await GoogleCategory.insertMany(batch, { ordered: false });
            console.log(`Injected ${Math.min(i + batchSize, docs.length)} / ${docs.length} categories.`);
        }

        console.log(`All ${docs.length} Google Categories injected successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Error during import:', error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
};

importData();
