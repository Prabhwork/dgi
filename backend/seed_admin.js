const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dbi');
        
        const existing = await Admin.findOne({ email: 'admin@dbi.com' });
        if (existing) {
            console.log('Admin already exists');
            process.exit(0);
        }

        await Admin.create({
            email: 'admin@dbi.com',
            password: 'admin123'
        });

        console.log('Admin created: admin@dbi.com / admin123');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
