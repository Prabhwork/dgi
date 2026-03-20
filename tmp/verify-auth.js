const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../backend/models/User');
const Business = require('../backend/models/Business');
const Admin = require('../backend/models/Admin');

dotenv.config({ path: '../backend/.env' });

async function verifyAuth() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = 'test_auth' + Date.now() + '@example.com';

        // 1. Create a User
        const user = await User.create({
            name: 'Test User',
            email: testEmail,
            phone: '1234567890',
            password: 'password123'
        });
        console.log('User created:', user.email);

        // 2. Try to create a Business with same email (Should fail if used in registerBusiness logic)
        // Note: We need to test the controller logic, but here we just check if it already exists.
        const existingInUser = await User.findOne({ email: testEmail });
        console.log('Checking if email exists in User:', !!existingInUser);

        // 3. Mock the checkEmailExists logic
        const checkEmailExists = async (email) => {
            const admin = await Admin.findOne({ email });
            const user = await User.findOne({ email });
            const business = await Business.findOne({ officialEmailAddress: email });
            return admin || user || business;
        };

        const exists = await checkEmailExists(testEmail);
        console.log('checkEmailExists for', testEmail, ':', !!exists);

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
