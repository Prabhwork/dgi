const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Business = require('./models/Business');
const Admin = require('./models/Admin');

dotenv.config();

async function verifyAuth() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = 'test_auth' + Date.now() + '@example.com';

        // 1. Create a User
        const user = await User.create({
            name: 'Test User',
            email: testEmail,
            phone: '1234567890_' + Date.now(),
            password: 'password123'
        });
        console.log('User created:', user.email);

        // 2. Mock the checkEmailExists logic (from authController)
        const checkEmailExists = async (email) => {
            const admin = await Admin.findOne({ email });
            const user = await User.findOne({ email });
            const business = await Business.findOne({ officialEmailAddress: email });
            return admin || user || business;
        };

        const exists = await checkEmailExists(testEmail);
        console.log('checkEmailExists for', testEmail, ':', !!exists);

        // 3. Check for uniqueness logic (simulating controller)
        if (exists) {
            console.log('Uniqueness check: Email already exists (Correct)');
        } else {
            console.log('Uniqueness check: Email NOT found (Incorrect)');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log('Test User cleaned up');

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
}

verifyAuth();
