require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('./models/Business');

async function testEncryption() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Create a mock business with an aadhaarNumber
        const mockBusiness = new Business({
            businessName: 'Encryption Test Business',
            businessCategory: 'Testing',
            registeredOfficeAddress: '123 Test Ave',
            primaryContactNumber: '9999988888',
            officialEmailAddress: 'test-encrypt@example.com',
            password: 'password123',
            aadhaarNumber: '123456789012'
        });

        // Delete if exists
        await Business.deleteOne({ officialEmailAddress: 'test-encrypt@example.com' });

        await mockBusiness.save();
        console.log('Saved mock business.');

        // 1. Fetch using native MongoDB driver to see raw database value
        const rawDoc = await mongoose.connection.collection('businesses').findOne({ officialEmailAddress: 'test-encrypt@example.com' });
        console.log('Raw Database Value (should be encrypted):', rawDoc.aadhaarNumber);

        // 2. Fetch using Mongoose to see decrypted value
        const mongooseDoc = await Business.findOne({ officialEmailAddress: 'test-encrypt@example.com' });
        console.log('Mongoose Decrypted Value:', mongooseDoc.aadhaarNumber);
        
        // 3. To JSON check
        console.log('JSON Serialized Value:', mongooseDoc.toJSON().aadhaarNumber);

        await Business.deleteOne({ officialEmailAddress: 'test-encrypt@example.com' });
        console.log('Cleaned up test data.');
        process.exit(0);

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

testEncryption();
