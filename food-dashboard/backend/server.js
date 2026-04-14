require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Route Imports ──────────────────────────────────────────────────────────────
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const staffRoutes = require('./routes/staffRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const supportRoutes = require('./routes/supportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const storeStatusRoutes = require('./routes/storeStatusRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bankRoutes = require('./routes/bankRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dineoutRoutes = require('./routes/dineoutRoutes');
const cartRoutes = require('./routes/cartRoutes');

// ── App Setup ──────────────────────────────────────────────────────────────────
const app = express();
connectDB();

app.use(cors({
  origin: [
    process.env.NEXT_PUBLIC_FRONTEND_URL,
    process.env.NEXT_PUBLIC_COMMUNITY_URL,
    process.env.NEXT_PUBLIC_FOOD_DASHBOARD_URL,
    process.env.NEXT_PUBLIC_FOOD_ADMIN_URL,
    'https://www.digitalbookofindia.com',
    'https://digitalbookofindia.com',
    'https://food.digitalbookofindia.com',
    'https://www.food.digitalbookofindia.com',
    'https://foodadmin.digitalbookofindia.com',
    'https://www.foodadmin.digitalbookofindia.com',
    'https://admin.digitalbookofindia.com',
    'https://www.admin.digitalbookofindia.com',
    'https://dgi-1-d7j2.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: '✅ Food Dashboard API Running',
  port: process.env.PORT,
  routes: [
    'GET /api/health',
    'GET /api/search?q=...',
    '/api/orders          — GET, POST, PUT /:id/status, DELETE /:id',
    '/api/orders/meta/stats',
    '/api/products        — GET, POST, PUT /:id, PUT /:id/toggle, DELETE /:id',
    '/api/staff           — GET, POST, PUT /:id, PUT /:id/attendance, PUT /:id/advance, DELETE /:id',
    '/api/staff/meta/payroll',
    '/api/reviews         — GET, POST, PUT /:id/reply, DELETE /:id',
    '/api/reviews/meta/summary',
    '/api/transactions    — GET, POST, PUT /:id/status',
    '/api/transactions/meta/summary',
    '/api/settlements     — GET, POST, PUT /:id/status',
    '/api/settlements/meta/wallet',
    '/api/categories      — GET, POST, PUT /:id, DELETE /:id',
    '/api/analytics/dashboard',
    '/api/analytics/monthly-sales',
    '/api/analytics/category-performance',
    '/api/analytics/kpis',
    '/api/promotions      — GET, POST, PUT /:id, DELETE /:id',
    '/api/promotions/meta/summary',
    '/api/support         — GET, POST, PUT /:id/status, DELETE /:id',
    '/api/settings        — GET, PUT',
    '/api/settings/toggle-live',
    '/api/settings/notifications',
    '/api/settings/hours',
    '/api/store-status    — GET, PUT',
    '/api/store-status/toggle-open',
    '/api/store-status/toggle-busy',
    '/api/store-status/toggle-mute',
    '/api/notifications   — GET, POST, PUT /:id/read, PUT /mark-all-read, DELETE /:id',
  ]
}));

// ── Core Data Routes ───────────────────────────────────────────────────────────
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/categories', categoryRoutes);

// ── Analytics & Business Intelligence ─────────────────────────────────────────
app.use('/api/analytics', analyticsRoutes);

// ── Promotions (Coupons & Campaigns) ──────────────────────────────────────────
app.use('/api/promotions', promotionRoutes);

// ── Support (Tickets + FAQs + Support Search) ────────────────────────────────
// Sub-routes: /api/support/tickets, /api/support/faqs, /api/support/search
app.use('/api/support', supportRoutes);

// ── Business Settings ──────────────────────────────────────────────────────────
app.use('/api/settings', settingsRoutes);

// ── Header Controls (Store Status Toggles) ────────────────────────────────────
app.use('/api/store-status', storeStatusRoutes);

// ── Notifications (Header Bell) ───────────────────────────────────────────────
app.use('/api/notifications', notificationRoutes);

// ── Global Search (Header Search Bar) ────────────────────────────────────────
app.use('/api/search', searchRoutes);

// ── File Uploads ─────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoutes);

// ── Bank Details & Admin Moderation ──────────────────────────────────────────
app.use('/api/bank-details', bankRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dineout', dineoutRoutes);
app.use('/api/cart', cartRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Error Handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {

});
