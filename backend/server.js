const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


dotenv.config();


connectDB();

const app = express();


const allowedOrigins = [
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  process.env.NEXT_PUBLIC_COMMUNITY_URL,
  'https://www.digitalbookofindia.com',
  'https://digitalbookofindia.com',
  'https://food.digitalbookofindia.com',
  'https://www.food.digitalbookofindia.com',
  'https://foodadmin.digitalbookofindia.com',
  'https://www.foodadmin.digitalbookofindia.com',
  'https://admin.digitalbookofindia.com',
  'https://www.admin.digitalbookofindia.com',
  'https://dgi-bpu3.onrender.com',
  'https://dgi-1-d7j2.onrender.com',
  'https://dgi-sss1.vercel.app',
  'https://dgi-r3dl.vercel.app',
  "https://coleen-unvirulent-rafael.ngrok-free.dev",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003"
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static('uploads'));


const auth = require('./routes/authRoutes');
const mainCategories = require('./routes/mainCategoryRoutes');
const categories = require('./routes/categoryRoutes');
const subcategories = require('./routes/subcategoryRoutes');
const features = require('./routes/featureRoutes');
const solutions = require('./routes/solutionRoutes');
const business = require('./routes/businessRoutes');
const pageDetails = require('./routes/pageDetailRoutes');
const contact = require('./routes/contactRoutes');
const upcomingCategories = require('./routes/upcomingCategoryRoutes');
const testimonials = require('./routes/testimonialRoutes');
const existingCustomers = require('./routes/existingCustomers');
const mainSubcategories = require('./routes/mainSubcategoryRoutes');
const googleCategories = require('./routes/googleCategoryRoutes');
const globalSettings = require('./routes/globalSettingsRoutes');
const funnel = require('./routes/funnelRoutes');
const suggestions = require('./routes/suggestionRoutes');
const wallet = require('./routes/walletRoutes');
const { startLiveListingWorker } = require('./utils/liveListingWorker');


// Re-route into other resource routers
mainCategories.use('/:mainCategoryId/main-subcategories', mainSubcategories);
categories.use('/:categoryId/subcategories', subcategories);
categories.use('/:categoryId/features', features);
categories.use('/:categoryId/solutions', solutions);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/main-categories', mainCategories);
app.use('/api/categories', categories);
app.use('/api/main-subcategories', mainSubcategories);
app.use('/api/subcategories', subcategories);
app.use('/api/features', features);
app.use('/api/solutions', solutions);
app.use('/api/business', business);
app.use('/api/page-details', pageDetails);

app.use('/api/contact', contact);
app.use('/api/upcoming-categories', upcomingCategories);
app.use('/api/testimonials', testimonials);
app.use('/api/existing-customers', existingCustomers);
app.use('/api/google-categories', googleCategories);
app.use('/api/global-settings', globalSettings);
app.use('/api/funnel', funnel);
app.use('/api/suggestions', suggestions);
app.use('/api/wallet', wallet);
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('Digital Book of India Admin API');
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startLiveListingWorker();
});
