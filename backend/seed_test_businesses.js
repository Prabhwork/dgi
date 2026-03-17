const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Business = require('./models/Business');

dotenv.config();

const categories = ['Retail', 'Health', 'Tech', 'Food', 'Education', 'Services'];

const generateRandomPhone = () => '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');

const seedBusinesses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const businesses = [];
        for (let i = 1; i <= 25; i++) {
            businesses.push({
                businessName: `Test Business ${i}`,
                brandName: `Brand ${i}`,
                businessCategory: categories[i % categories.length],
                description: `This is a test description for Business ${i}. Providing excellent services in the ${categories[i % categories.length]} sector.`,
                keywords: ['test', categories[i % categories.length].toLowerCase(), 'local'],
                gpsCoordinates: {
                    lat: 28.6139 + (Math.random() * 0.1 - 0.05), // Approximate Delhi lat
                    lng: 77.2090 + (Math.random() * 0.1 - 0.05), // Approximate Delhi lng
                    address: `Test Address ${i}, Sector ${i % 20 + 1}, New Delhi`
                },
                registeredOfficeAddress: `Test Address ${i}, Sector ${i % 20 + 1}, New Delhi, India`,
                primaryContactNumber: generateRandomPhone(),
                password: 'password123', // Will be hashed by pre-save hook
                officialWhatsAppNumber: generateRandomPhone(),
                officialEmailAddress: `testbz${i}@example.com`,
                openingTime: '09:00',
                closingTime: '18:00',
                weeklyOff: 'Sunday',
                aadhaarNumber: `XXXXXXXX${Math.floor(1000 + Math.random() * 9000)}`, // Masked
                aadhaarVerified: i % 3 === 0, // Randomly verify some
                website: `www.testbz${i}.com`,
                joinBulkBuying: i % 2 === 0,
                joinFraudAlerts: i % 2 !== 0,
                isActive: true,
                isEmailVerified: true,
                isVerified: true,
                approvalStatus: 'approved' // Automatically approve them for testing
            });
        }

        for (const b of businesses) {
            try {
                await Business.create(b);
            } catch (createErr) {
                console.error(`Error creating business ${b.businessName}:`, createErr.message);
            }
        }
        console.log('25 Test Businesses Processed!');

        process.exit();
    } catch (err) {
        console.error('Fatal Error:', err.message || err);
        process.exit(1);
    }
};

seedBusinesses();
