const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const UpcomingCategory = require('./models/UpcomingCategory');

dotenv.config({ path: path.join(__dirname, '.env') });

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the 'Sale In Your Zone' with 'CalendarClock' icon
        const duplicate = await UpcomingCategory.findOne({ 
            title: 'Sale In Your Zone', 
            icon: 'CalendarClock' 
        });

        if (duplicate) {
            duplicate.title = 'Pre-Book(Anything)';
            // Also update description if it's the wrong one
            duplicate.description = "In today's fast-moving digital world, customers expect convenience, speed, and guaranteed availability. Pre-booking is no longer just an option—it's a smart way to stay ahead.";
            await duplicate.save();
            console.log('Successfully fixed duplicate title to "Pre-Book(Anything)"');
        } else {
            console.log('No duplicate "Sale In Your Zone" with "CalendarClock" icon found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fix();
