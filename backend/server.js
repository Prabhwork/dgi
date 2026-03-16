const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Route files
const auth = require('./routes/authRoutes');
const mainCategories = require('./routes/mainCategoryRoutes');
const categories = require('./routes/categoryRoutes');
const subcategories = require('./routes/subcategoryRoutes');
const features = require('./routes/featureRoutes');
const solutions = require('./routes/solutionRoutes');
const business = require('./routes/businessRoutes');
const pageDetails = require('./routes/pageDetailRoutes');

// Re-route into other resource routers
// Re-route into other resource routers
categories.use('/:categoryId/subcategories', subcategories);
categories.use('/:categoryId/features', features);
categories.use('/:categoryId/solutions', solutions);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/main-categories', mainCategories);
app.use('/api/categories', categories);
app.use('/api/subcategories', subcategories);
app.use('/api/features', features);
app.use('/api/solutions', solutions);
app.use('/api/business', business);
app.use('/api/page-details', pageDetails);

app.get('/', (req, res) => {
    res.send('Digital Book of India Admin API');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
