const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Category = require('./models/Category');

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const filePath = path.join(__dirname, 'categories.txt');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        const uniqueCategories = [
            ...new Set(
                lines
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
            )
        ];

        console.log(`Found ${uniqueCategories.length} unique categories in file.`);

        // We use bulkWrite for efficiency
        const operations = uniqueCategories.map(name => ({
            updateOne: {
                filter: { name },
                update: { 
                    $setOnInsert: { 
                        name, 
                        description: 'Official Google Business Category',
                        isActive: true
                    } 
                },
                upsert: true
            }
        }));

        console.log('Starting bulk insertion into Category collection...');
        const batchSize = 500;
        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            await Category.bulkWrite(batch);
            console.log(`Processed ${Math.min(i + batchSize, operations.length)}/${operations.length}`);
        }

        console.log('Seed completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding categories:', err);
        process.exit(1);
    }
};

seedCategories();
