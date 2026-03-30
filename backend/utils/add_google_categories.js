const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const GoogleCategory = require('../models/GoogleCategory');

dotenv.config({ path: path.join(__dirname, '../.env') });

const NEW_CATEGORIES = [
    "Body Massage Centres", "Cinema Halls", "Schools", "Beauty Spas", "Dermatologists", "Hospitals", "Malls", "Gyms", "Beauty Parlours", "Estate Agents", "Banquet Halls", "ENT Doctors", "Book Shops", "Bike On Rent",
    "Sexologist Doctors", "Neurologists", "Gynaecologist & Obstetrician Doctors", "Train Ticket Booking Agents", "Travel Agents", "Paying Guest Accommodations", "General Physician Doctors", "Dentists", "Orthopaedic Doctors",
    "Chemists", "Motor Training Schools", "Gastroenterologists", "Car Rental", "Salons", "Courier Services", "Dance Classes", "Pathology Labs", "Taxi Services", "Cake Shops", "AC Repair & Services", "Mobile Phone Dealers",
    "Pet Shops", "Dmart", "Packers And Movers", "Psychiatrists", "Dharamshalas", "Urologist Doctors", "Bakeries", "Bicycle Dealers", "Coffee Shops", "Paediatricians", "Sonography Centres", "Yoga Classes", "Hostels",
    "Cardiologists", "Electrical Shops", "Skin Care Clinics", "Diagnostic Centres", "Homeopathic Doctors", "Physiotherapists", "Photo Studios", "Plumbers", "Music Classes", "Electricians", "Sports Goods Dealers", "Shoe Dealers",
    "Hair Stylists", "Gift Shops", "Ophthalmologists", "Car Repair & Services", "Ayurvedic Doctors", "Eye Clinics", "Restaurants", "Carpenters", "Jewellery Showrooms", "Cooks On Hire", "Stationery Shops", "Nephrologists",
    "Caterers", "Interior Designers", "Rehabilitation Center", "Grocery Stores", "Banks", "ATM", "5 Star Hotels", "Hotels", "Resorts", "Plastic Surgeons", "Smart Watch Dealers", "Drug De Addiction Centres", "Chinese Restaurants"
];

const addCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        let addedCount = 0;
        let skippedCount = 0;

        for (const name of NEW_CATEGORIES) {
            const exists = await GoogleCategory.findOne({ name });
            if (!exists) {
                await GoogleCategory.create({ name });
                addedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`Finished: ${addedCount} added, ${skippedCount} skipped.`);
        process.exit();
    } catch (err) {
        console.error('Error adding google categories:', err);
        process.exit(1);
    }
};

addCategories();
