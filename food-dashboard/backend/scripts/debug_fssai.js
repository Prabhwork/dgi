const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Settings = require('../models/Settings');
const FSSAISubmission = require('../models/FSSAISubmission');

async function debugFssai() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const partners = [
            '69b93a0452f3d2ba12cb2d27',
            '69b93a0452f3dd2ba12cb2d27'
        ];

        for (const pid of partners) {
            console.log(`\n--- Debugging Partner: ${pid} ---`);
            
            const submission = await FSSAISubmission.findOne({ partnerId: pid });
            console.log('Submission Status:', submission ? submission.status : 'NOT FOUND');
            console.log('Submission FSSAI:', submission ? submission.fssaiNumber : 'N/A');

            const settings = await Settings.findOne({ partnerId: pid });
            if (settings) {
                console.log('Settings found!');
                console.log('Settings FSSAI:', settings.fssai || 'EMPTY');
            } else {
                console.log('Settings NOT FOUND for this partnerId');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugFssai();
