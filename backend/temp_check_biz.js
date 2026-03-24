const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const Business = require('./models/Business');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const b = await Business.findOne({ 
            $or: [
                { businessName: /techentia/i }, 
                { brandName: /techentia/i }
            ] 
        });
        if (b) {
            console.log(JSON.stringify({ 
                name: b.businessName, 
                brand: b.brandName, 
                status: b.approvalStatus, 
                active: b.isActive, 
                coords: b.gpsCoordinates 
            }, null, 2));
        } else {
            console.log('Not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
