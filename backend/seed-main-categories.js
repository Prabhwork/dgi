/**
 * Seed script: Main Categories + Main Subcategories
 * Run: node seed-main-categories.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MainCategory = require('./models/MainCategory');
const MainSubcategory = require('./models/MainSubcategory');

const data = [
    {
        name: 'Restaurants',
        icon: 'UtensilsCrossed',
        description: 'Food & dining options including restaurants, cafes, takeout, and delivery',
        subcategories: [
            'Takeout', 'Deliveries', 'Hot & Trendy', 'New Restaurant', 'Breakfast & Brunch',
            'Lunch', 'Dinner', 'Coffee & Cafes', 'Pizza', 'Chinese', 'Mexican', 'Bakeries',
            'Italian', 'Food Trucks', 'Sports Bars & Pubs', 'Moroccan', 'Indian', 'Fast Food',
            'Steakhouses', 'Japanese', 'New American', 'Cajun/Creole', 'Latin American', 'French',
            'Vegetarian', 'Vietnamese', 'Middle Eastern', 'Ethiopian', 'Spanish', 'Thai',
            'Sushi Bars', 'American', 'Korean', 'Tapas Bars', 'Seafood', 'Greek', 'Turkish',
            'Burmese', 'British', 'Irish', 'Asian Fusion', 'Delis', 'Sandwiches', 'Afghan',
            'German', 'Taiwanese', 'Tex-Mex', 'Food Stands', 'Hawaiian', 'Southern', 'Barbeque',
            'Filipino', 'Creperies', 'Diners', 'Caribbean', 'Cuban', 'Burgers', 'Hot Dogs',
            'Himalayan/Nepalese', 'Buffets', 'Brazilian', 'Soul Food', 'Vegan', 'Fondue',
            'Russian', 'Singaporean', 'Argentine', 'Cambodian', 'Indonesian', 'Live/Raw Food',
            'Malaysian', 'Mongolian', 'Scandinavian', 'Gluten-Free', 'Halal', 'Chicken Wings',
            'African', 'Kosher', 'Belgian', 'Hungarian', 'Persian/Iranian', 'Polish', 'Ukrainian',
            'Fish & Chips', 'Basque', 'Mediterranean', 'Pakistani', 'Portuguese', 'Brasseries',
            'Gastropubs', 'Modern European', 'Cheesesteaks', 'Peruvian', 'Soup', 'Tapas/Small Plates',
            'Cafes', 'Austrian', 'Bulgarian', 'Kebab', 'Australian', 'Scottish', 'Arabic',
            'Chicken Shop', 'Food Court', 'Salad', 'Wraps', 'Cafeteria', 'Bangladeshi',
            'Catalan', 'Hot Pot', 'Tibetan', 'Laotian', 'Poutineries', 'Comfort Food', 'Armenian',
            'Czech', 'Slovakian', 'Uzbek', 'Hong Kong Style Cafe', 'Sri Lankan', 'Supper Clubs',
            'Syrian', 'Dinner Theater', 'Nicaraguan', 'Waffles', 'New Mexican Cuisine', 'Noodles',
            'Pop-Up Restaurants', 'Pan Asian', 'Guamanian', 'Honduran', 'Game Meat', 'Polynesian',
            'Somali', 'Eritrean'
        ]
    },
    {
        name: 'Home & Garden',
        icon: 'Home',
        description: 'Home improvement, repair, and garden services',
        subcategories: [
            'Contractor & Handyman', 'Plumber', 'Electrician', 'Heating & Air Conditioning',
            'Appliance & Repair', 'Roofing', 'Keys & Locksmiths', 'Painter', 'Landscaping',
            'Nursery & Gardening', 'Florist', 'Tree Service', 'Home Cleaning', 'Furniture Store',
            'Movers', 'Interior Design', 'Real Estate', 'General Contractors', 'Carpeting',
            'Shades & Blinds', 'Building Supplies', 'Light Fixtures & Equipment', 'Home Inspectors',
            'Flooring', 'Internet Service Providers', 'Landscape Architects & Designers',
            'Security Systems', 'Windows Installation', 'Window Washing', 'Pool Cleaners',
            'Solar Installation', 'Home Theatre Installation', 'Television Service Providers',
            'Carpenters', 'Garage Door Services', 'Home Organization', 'Masonry/Concrete',
            'Utilities', 'Home Window Tinting', 'Irrigation', 'Damage Restoration',
            'Chimney Sweeps', 'Structural Engineers', 'Fences & Gates', 'Glass Mirrors',
            'Gutter Services', 'Door Sales/Installation', 'Drywall Installation & Repair',
            'Cabinetry', 'Pressure Washers', 'Pool & Hot Tub Service', 'Firewood',
            'Fireplace Services', 'Insulation Installation', 'Shutters', 'Furniture Assembly',
            'Stucco Services', 'Refinishing Services', 'Fire Protection Services',
            'Water Purification Services', 'Home Automation', 'Demolition Services',
            'House Sitters', 'Childproofing', 'Tiling', 'Roof Inspectors',
            'Water Heater Installation/Repair', 'Siding', 'Countertop Installation',
            'Home Network Installation', 'Decks & Railing', 'Waterproofing', 'Patio Coverings',
            'Holiday Decorative Services', 'Home Energy Auditors', 'Artificial Turf',
            'Packing Services', 'Solar Panel Cleaning', 'Excavation Services',
            'Mobile Home Repair', 'Foundation Repair', 'Wallpapering Services', 'Grout Services'
        ]
    },
    {
        name: 'Auto Service',
        icon: 'Car',
        description: 'Automotive repair, sales, and related services',
        subcategories: [
            'Auto Repair', 'Body Shops', 'Oil Change Station', 'Tires', 'Towing', 'Car Wash',
            'Auto Detailing', 'Parking', 'Car Dealer', 'Junkyards', 'Bike Dealers', 'Bike Repair',
            'Gas Station', 'Pollution Check', 'Car Stereo Installation', 'Auto Glass Service',
            'Windshield Installation & Repair', 'Auto Parts & Suppliers', 'RV Dealers',
            'Truck Rentals', 'Boat Dealers', 'Auto Loan Providers', 'Aircraft Dealers',
            'Auto Customization', 'Registration Services', 'Wheel & Rim Repair',
            'Vehicle Shipping', 'Car Share Service', 'RV Repair', 'Car Inspectors',
            'Car Buyers', 'Mobile Dent Repair', 'Fuel Docks', 'Marinas', 'Transmission Repair',
            'Car Broker', 'Mobility Equipment Sales & Services', 'Motorsport Vehicle Dealers',
            'Roadside Assistance', 'Trailer Dealer', 'Trailer Repair', 'Auto Upholstery',
            'Vehicle Wraps', 'Commercial Truck Dealer', 'Commercial Truck Repair',
            'Aircraft Repairs', 'Auto Security', 'Car Auctions', 'EV Charging Station',
            'Used Car Dealers', 'Trailer Rentals', 'Service Stations', 'Interlock Systems',
            'Hybrid Car Repair', 'Golf Cart Dealers', 'Aviation Services',
            'Boat Parts & Suppliers'
        ]
    },
    {
        name: 'Health & Beauty',
        icon: 'Heart',
        description: 'Healthcare, wellness, beauty, and personal care services',
        subcategories: [
            'Dentist', 'Medical Centers', 'Hospitals', 'Acupuncture', 'Counseling & Mental Health',
            'Midwives', 'Cannabis Clinic', 'Nutritionists', 'Urgent Care', 'Retirement Homes',
            'Medical Spas', 'Weight Loss Centers', 'Laser Eye Surgery/Lasik', 'Home Health Care',
            'Traditional Chinese Medicine', 'Speech Therapists', 'Saunas', 'Pharmacy',
            'Hospice', 'Rehabilitation Center', 'Massage Therapy', 'Reflexology',
            'Lactation Services', 'Hearing Aid Providers', 'Occupational Therapy',
            'Diagnostic Services', 'Medical Transportation', 'Dental Hygienists',
            'Hypnosis/Hypnotherapy', 'Doulas', 'Health Insurance Offices', 'Reiki',
            'Emergency Rooms', 'Lice Services', 'Orthotics', 'Prosthetics', 'Sleep Specialists',
            'Nurse Practitioner', 'Dialysis Clinics', 'Colonics', 'Prenatal/Perinatal Care',
            'Blood & Plasma Donation Centers', 'Personal Care Services', 'Habilitative Services',
            'Assisted Living Facilities', 'Oxygen Bars', 'Placenta Encapsulation', 'Halotherapy',
            'Concierge Medicine', 'Ayurveda', 'Prosthodontists', 'IV Hydration', 'Sperm Clinic',
            'Dietitians', 'Float Spa', 'Hydrotherapy', 'Medical Cannabis Referrals',
            'Skilled Nursing', 'Behavior Analysts', 'Cryotherapy', 'Halfway Houses',
            'Herbal Shops', 'Organ & Tissue Donor Services', 'Cannabis Collective',
            'Animal Assisted Therapy', 'Body Contouring', 'Health Coach', 'Alternative Medicine',
            'Memory Care', 'Ultrasound Imaging Centers', 'Crisis Pregnancy Centers',
            'Reproductive Health Services', 'Doctors', 'Chiropractors', 'Optometrists',
            'Dermatologists', 'Podiatrists', 'Massage', 'Hair Salon', 'Nail Salon', 'Barbers',
            'Day Spas', 'Physical Therapy', 'Skin Care', 'Cosmetic & Beauty Supply', 'Tanning',
            'Hair Removal', 'Tattoo', 'Piercing', 'Makeup Artists', 'Eyelash Service',
            'Perfume', 'Hair Extensions', 'Permanent Makeup', 'Hair Loss Centers', 'Hot Springs',
            'Teeth Whitening', 'Acne Treatment', 'Eyebrow Services', 'Hair Spa Services'
        ]
    },
    {
        name: 'Travel & Active Life',
        icon: 'Plane',
        description: 'Tourism, outdoor activities, sports, and entertainment venues',
        subcategories: [
            'Things To Do', 'Kids Activities & Camps', 'Venues & Events', 'Churches', 'Temples',
            'Mosque', 'Gurudwara', 'Shopping Mall', 'Bookstore', 'Mini Golf', 'Bowling', 'Hotels',
            'Taxis', 'Bike Rentals', 'Campground', 'Beaches', 'Swimming Pool', 'Bar & Nightlife',
            'India/Delhi Tours', 'Local City Tours', 'Amusement Parks', 'Zoos',
            'Amateur Sports Teams', 'Tennis', 'Boating', 'Playground', 'Aquarium', 'Parks',
            'Skating Rinks', 'Hiking', 'Diving', 'Gun/Rifle Ranges', 'Summer Camps', 'Lakes',
            'Rafting', 'Sports Clubs', 'Soccer', 'Archery', 'Climbing', 'Horseback Riding',
            'Fishing', 'Skydiving', 'Go Karts', 'Disc Golf', 'Hot Air Balloons', 'Horse Racing',
            'Sailing', 'Mountain Biking', 'Recreation Centers', 'Indoor Play Center', 'Paintball',
            'Rock Climbing', 'Surfing', 'Tubing', 'Kite Boarding', 'Paddle Boarding',
            'Hang Gliding', 'Trampoline Parks', 'Badminton', 'Squash', 'Gymnastics', 'Laser Tag',
            'Zorbing', 'Bungee Jumping', 'Basketball Courts', 'Sledding', 'Challenge Courses',
            'Cycling Class', 'Day Camps', 'Fencing Club', 'Jet Skis', 'ATV Rental Tours',
            'Batting Cages', 'Flyboarding', 'Wildlife Hunting Ranges', 'Races & Competitions',
            'Snorkeling', 'Escape Games', 'Water Parks', 'Carousels', 'Zip Lining',
            'Baseball Fields', 'Airsoft', 'Beach Equipment Rentals', 'Scavenger Hunts',
            'Bike Parking', 'Racing Experience', 'Senior Centers', 'Bocce Ball', 'Parasailing',
            'Bobsledding', 'Bubble Soccer', 'Scooter Rentals', 'Axe Throwing', 'Canyoneering',
            'Dart Arenas', 'Pickleball', 'Paragliding'
        ]
    },
    {
        name: 'More Activities',
        icon: 'Zap',
        description: 'Everyday services including laundry, fitness, and pet grooming',
        subcategories: [
            'Dry Cleaning', 'Laundromats', 'Thrift Stores', 'Tailor & Alteration',
            'Apartments on Rent', 'Junk Removal', 'Gyms', 'Yoga & Pilates', 'Pet Groomers',
            'Bank & Credit Unions', 'Real Estate Agents', 'Parking Area', 'Monthly Car Parking'
        ]
    },
    {
        name: 'Education',
        icon: 'BookOpen',
        description: 'Schools, colleges, tutoring, and educational services',
        subcategories: [
            'Colleges & Universities', 'Preschools', 'Specialty Schools',
            'Middle Schools & High Schools', 'Elementary Schools', 'Adult Education',
            'Tutoring Centers', 'Educational Services', 'Private Tutors', 'Special Education',
            'Test Preparation', 'Private Schools', 'Religious Schools', 'College Counseling',
            'Art Classes', 'Tasting Classes', 'Montessori Schools', 'Waldorf Schools'
        ]
    },
    {
        name: 'Professional Services',
        icon: 'Briefcase',
        description: 'Legal, consulting, design, and other professional services',
        subcategories: [
            'Lawyers', 'Accountants', 'Employment Agencies', 'Web Design', 'Graphic Design',
            'Architects', 'Internet Service Providers', 'Marketing', 'Advertising',
            'Public Relations', 'Video/Film Production', 'Office Cleaning', 'Private Investigation',
            'Life Coach', 'Career Counseling', 'Security Services', 'Boat Repair',
            'Translation Services', 'Talent Agencies', 'Matchmakers', 'Personal Assistance',
            'Editorial Services', 'Taxidermy', 'Payroll Services', 'Legal Services',
            'Sign Making', 'Patent Law', 'Software Development', 'Shredding Services',
            'Tenant & Eviction Law', 'Music Production Services', 'Business Consulting',
            'Product Design', 'Mediators', 'Commissioned Artists', 'Indoor Landscaping',
            'Billing Services', 'Bookkeepers', 'Custom Brokers', 'Digitizing Services',
            'Duplication Services', 'Feng Shui', 'Wholesalers', 'Public Adjusters',
            'Art Consultants'
        ]
    },
    {
        name: 'Event Planning & Services',
        icon: 'CalendarHeart',
        description: 'Event planning, catering, photography, and entertainment services',
        subcategories: [
            'Party & Event Planning', 'Cards & Stationery', 'Caterers', 'Venue & Event Spaces',
            'Party Supplies', 'Hotels', 'Boat Charters', 'Photographers', 'Personal Chefs',
            'DJs', 'Wedding Planning', 'Videographers', 'Magicians', 'Clowns', 'Officiants',
            'Musicians', 'Bartenders', 'Party Bus Rentals', 'Party Equipment Rentals',
            'Photo Booth Rentals', 'Trivia Hosts', 'Valet Services', 'Face Painting', 'Mohels',
            'Party Bike Rentals', 'Party Characters', 'Henna Artists', 'Wedding Chapels',
            'Caricatures', 'Golf Cart Rentals', 'Game Truck Rentals', 'Silent Disco',
            'Sommelier Services', 'Team Building Activities', 'Balloon Services',
            'Floral Designers'
        ]
    },
    {
        name: 'Financial Services',
        icon: 'DollarSign',
        description: 'Banking, insurance, investing, and financial advisory services',
        subcategories: [
            'Insurance', 'Investing', 'Banks & Credit Unions', 'Check Cashing/Pay-day Loans',
            'Financial Advising', 'Tax Services', 'Debt Relief Services', 'Currency Exchange',
            'Title Loans', 'Business Financing', 'Installment Loans', 'Mortgage Lenders/Loans',
            'CA Services', 'CS Services'
        ]
    },
    {
        name: 'Reservations',
        icon: 'CalendarCheck',
        description: 'Table bookings, product reservations, and waitlist services',
        subcategories: [
            'Table Reservations', 'Product Pre-booking', 'Arrival Wait Service',
            'Online Booking', 'Walk-in Management'
        ]
    },
    {
        name: 'Arts & Entertainment',
        icon: 'Music',
        description: 'Cinemas, music, art, and entertainment venues',
        subcategories: [
            'Cinemas', 'Music Venues', 'Casinos', 'Wineries', 'Jazz & Blues',
            'Stadiums & Arenas', 'Art Galleries', 'Professional Sports Teams', 'Museums',
            'Performing Arts', 'Botanical Gardens', 'Arcades', 'Supernatural Reading',
            'Social Clubs', 'Festivals', 'Opera & Ballet', 'Ticket Sales', 'Cultural Center',
            'Race Tracks', 'Cabaret', 'Planetarium', 'Bingo Halls', 'Country Clubs',
            'Observatories', 'Paint & Sip', 'LAN Centers', 'Farms', 'Haunted Houses',
            'Studio Taping', 'Rodeo', 'Virtual Reality Center', 'Makerspaces', 'Sports Betting'
        ]
    },
    {
        name: 'Hotels & Travel',
        icon: 'Building2',
        description: 'Hotels, accommodation, transportation, and travel services',
        subcategories: [
            'Tours', 'Bed & Breakfast', 'Car Rentals', 'Airports', 'Ski Resorts', 'Hotels',
            'Transportation', 'Campgrounds', 'Hostels', 'Guest Houses', 'RV Rentals',
            'Vacation Rental Agents', 'Train Stations', 'Motorcycle Rentals', 'Vacation Rentals',
            'Resorts', 'RV Parks', 'Health Retreats'
        ]
    },
    {
        name: 'Local Services Mix',
        icon: 'Wrench',
        description: 'IT, printing, funeral, delivery, and other local services',
        subcategories: [
            'IT Services & Computer Repair', 'Sewing & Alterations', 'Appliances & Repair',
            'Funeral Services & Cemeteries', 'Printing Services', 'Courier & Delivery Services',
            'Self-Storage', 'Notaries', 'Community Service/Non-Profit',
            'Recording & Rehearsal Studios', 'Pest Control', 'Carpet Cleaning', 'Watch Repair',
            'Furniture Reupholstery', 'Shipping Centers', 'Junk Removal & Hauling',
            'Electronics Repair', 'Recycling Center', 'Bail Bondsmen', 'Screen Printing',
            'Snow Removal', 'Bike Repair/Maintenance', 'Screen Printing/T-Shirt Printing',
            'Jewellery Repair', 'Nanny Services', 'Propane', 'Metal Fabricators',
            'Knife Sharpening', 'Water Delivery', 'Septic Services', 'Powder Coating',
            'Furniture Repair', 'Appraisal Services', 'Bookbinding', 'Mailbox Centers',
            'Musical Instrument Services', 'Adoption Services', 'Machine & Tool Rentals',
            'Community Gardens', 'Community Centers', 'Furniture Rentals', 'Bus Rentals',
            '3D Printing', 'Engraving', 'Art Restoration', 'Elder Care Planning',
            'Farm Equipment Repair', 'Well Drilling', 'Air Duct Cleaning', 'Clock Repair',
            'Awnings', 'Calligraphy', 'Community Book Box', 'Crane Services', 'Sandblasting',
            'Shoe Shine', 'TV Mounting', 'Wildlife Control', 'Environmental Testing',
            'Fingerprinting', 'Hydro-Jetting', 'Machine Shops', 'Environmental Abatement',
            'Laundry Services', 'Generator Installation/Repair', 'Hazardous Waste Disposal',
            'Ice Delivery', 'Misting System Services', 'Gunsmith', 'Carpet Dyeing',
            'Donation Center', 'Biohazard Cleanup', 'Stonemasons', 'Grill Services',
            'Art Installation', 'Elevator Services', 'Portable Toilet Services'
        ]
    },
    {
        name: 'Mass Media',
        icon: 'Tv',
        description: 'Print, television, and radio media organizations',
        subcategories: [
            'Print Media', 'Television Stations', 'Radio Stations'
        ]
    },
    {
        name: 'All Nightlife',
        icon: 'Moon',
        description: 'Bars, clubs, comedy, and nightlife entertainment',
        subcategories: [
            'Comedy Clubs', 'Music Venues', 'Bars', 'Pool Halls', 'Jazz & Blues',
            'Dance Clubs', 'Adult Entertainment', 'Karaoke', 'Piano Bars', 'Beer Gardens',
            'Country Dance Halls', 'Bar Crawl', 'Club Crawl'
        ]
    },
    {
        name: 'All Pets',
        icon: 'PawPrint',
        description: 'Veterinary, grooming, boarding, and pet services',
        subcategories: [
            'Veterinarians', 'Pet Services', 'Animal Shelters', 'Pet Stores',
            'Horse Boarding', 'Pet Adoption', 'Pet Groomers', 'Pet Training'
        ]
    },
    {
        name: 'Public Services & Government',
        icon: 'Landmark',
        description: 'Government offices, emergency services, and public facilities',
        subcategories: [
            'Libraries', 'Post Offices', 'Landmark & Historical Buildings',
            'Department of Motor Vehicles', 'Police Departments', 'Embassy', 'Courthouses',
            'Community Centers', 'Fire Departments', 'Town Hall', 'Civic Center',
            'Municipality', 'Jails & Prisons'
        ]
    },
    {
        name: 'Real Estate',
        icon: 'MapPin',
        description: 'Property buying, renting, management, and related services',
        subcategories: [
            'Real Estate Agents', 'Real Estate Services', 'Apartments', 'Property Management',
            'Mortgage Brokers', 'University Housing', 'Home Staging', 'Commercial Real Estate',
            'Shared Office Spaces', 'Kitchen Incubators', 'Mobile Home Dealers',
            'Art Space Rentals', 'Estate Liquidation', 'Mobile Home Parks',
            'Homeowner Association', 'Housing Cooperatives', 'Condominiums', 'Home Developers'
        ]
    },
    {
        name: 'Religious Organizations',
        icon: 'Church',
        description: 'Places of worship and religious community services',
        subcategories: [
            'Churches', 'Mosques', 'Synagogues', 'Buddhist Temples', 'Hindu Temples',
            'Sikh Temples', 'Spiritual Centers', 'Prayer Halls'
        ]
    },
    {
        name: 'All Shopping',
        icon: 'ShoppingBag',
        description: 'Retail stores, markets, and shopping destinations',
        subcategories: [
            'Tobacco Shops', 'Cosmetics & Beauty Supply', 'Office Equipment', 'Bridal', 'Fashion',
            'Antiques', 'Arts & Crafts', 'Toy Stores', 'Home & Garden', 'Shopping Center',
            'Jewellery', 'Drugstores', 'Electronics', 'Sports Goods', 'Arts Galleries',
            'Eyewear & Opticians', 'Department Stores', 'Music Instruments & Teachers',
            'Adult Shops', 'Flower & Gifts', 'Computers', 'Hobby Shops',
            'Books, Mags, Music & Video', 'Mobile Phones', 'Photography Stores & Services',
            'Luggage', 'Watches', 'Pawnshops', 'Thrift Stores', 'Personal Shopping',
            'Outlet Stores', 'Wholesale Stores', 'Baby Gear & Furniture', 'Discount Stores',
            'Knitting Supplies', 'Perfume', 'Souvenir Shops', 'Used Bookstores', 'Flea Markets',
            'Spiritual Shop', 'Guns & Ammo', 'Fireworks', 'Wigs', 'Uniforms', 'Auction Houses',
            'Bespoke Clothing', 'Medical Supplies', 'Pop-Up Shops', 'Motorcycle Gear',
            'Trophy Shops', 'Pool & Billiards', 'Gold Buyers', 'Brewing Supplies',
            'Customized Merchandise', 'Vape Shops', 'Fitness/Exercise Equipment',
            'High Fidelity Audio Equipment', 'Horse Equipment Shops', 'Battery Stores',
            'Vitamins & Supplements', 'Head Shops', 'Mobile Phone Accessories',
            'Farming Equipment', 'Livestock Feed & Supply', 'Duty Free Shops', 'Tabletop Games',
            'Cannabis Dispensaries', 'Packing Supplies', 'Props', 'Religious Items',
            'Teacher Supplies', 'Safety Equipment', 'Public Markets', 'Safe Stores',
            'Military Surplus', 'Drones', 'Gemstones & Minerals', 'Diamond Buyers'
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Optional: clear existing data
        // await MainCategory.deleteMany({});
        // await MainSubcategory.deleteMany({});

        for (const item of data) {
            // Upsert main category
            let mainCat = await MainCategory.findOne({ name: item.name });
            if (!mainCat) {
                mainCat = await MainCategory.create({
                    name: item.name,
                    description: item.description,
                    isActive: true
                });
                console.log(`➕ Created Main Category: ${item.name}`);
            } else {
                console.log(`⚡ Exists: ${item.name} — skipping create`);
            }

            // Upsert subcategories
            let added = 0;
            for (const subcatName of item.subcategories) {
                const exists = await MainSubcategory.findOne({ name: subcatName, mainCategory: mainCat._id });
                if (!exists) {
                    await MainSubcategory.create({ name: subcatName, mainCategory: mainCat._id, isActive: true });
                    added++;
                }
            }
            console.log(`   └─ ${added} subcategories added for "${item.name}"`);
        }

        console.log('\n✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();
