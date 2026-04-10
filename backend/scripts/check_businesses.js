const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check Business model (Main App)
        // We'll use dynamic require or assume path
        const Business = require('../models/Business');
        const businesses = await Business.find({ 
            officialEmailAddress: { $in: ['dominos@dbi.com', 'sagarratna@dbi.com', 'haldirams@dbi.com'] } 
        });

        console.log('Found Businesses:', businesses.map(b => b.officialEmailAddress));

        if (businesses.length < 3) {
            console.log('Missing some businesses. Seeding...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash('Dbi@123', salt);

            const data = [
                {
                    businessName: "Domino's Pizza",
                    brandName: "Domino's",
                    officialEmailAddress: "dominos@dbi.com",
                    password: password,
                    businessCategory: "Restaurants",
                    approvalStatus: "approved",
                    isVerified: true
                },
                {
                    businessName: "Sagar Ratna",
                    brandName: "Sagar Ratna",
                    officialEmailAddress: "sagarratna@dbi.com",
                    password: password,
                    businessCategory: "Restaurants",
                    approvalStatus: "approved",
                    isVerified: true
                },
                {
                    businessName: "Haldiram's",
                    brandName: "Haldiram's",
                    officialEmailAddress: "haldirams@dbi.com",
                    password: password,
                    businessCategory: "Restaurants",
                    approvalStatus: "approved",
                    isVerified: true
                }
            ];

            for (const b of data) {
                await Business.findOneAndUpdate(
                    { officialEmailAddress: b.officialEmailAddress },
                    b,
                    { upsert: true, new: true }
                );
            }
            console.log('Seeding complete.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

check();
