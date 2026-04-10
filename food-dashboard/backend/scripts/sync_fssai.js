const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');
const FSSAISubmission = require('../models/FSSAISubmission');

async function syncAllApproved() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const approvedSubmissions = await FSSAISubmission.find({ status: 'Approved' });
        console.log(`Found ${approvedSubmissions.length} approved submissions to sync.`);

        for (const sub of approvedSubmissions) {
            console.log(`Syncing Partner: ${sub.partnerId} (${sub.businessName})`);
            
            const result = await Settings.findOneAndUpdate(
                { partnerId: sub.partnerId },
                { fssai: sub.fssaiNumber },
                { new: true, upsert: true }
            );
            
            console.log(` -> Success! Settings FSSAI set to: ${result.fssai}`);
        }

        console.log('\n--- Sync Complete! ---');
        process.exit(0);
    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

syncAllApproved();
