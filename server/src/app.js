// ============================================================
// src/app.js — Express application setup
// ============================================================
// This file configures the Express app with all middleware,
// routes, and error handling. It's separate from server.js
// so that the app can be tested without starting the server.
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const flashSaleRoutes = require('./routes/flashSaleRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// ───────────────────────────── Middleware ─────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow requests from the React frontend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    // In development, allow any localhost origin (port may vary)
    if (config.nodeEnv === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // In production, only allow the configured client URL
    if (origin === config.clientUrl) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parse JSON request bodies (limit to 10MB for image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (skip health checks to reduce noise)
app.use(morgan('dev', {
  skip: (req) => req.url === '/api/health',
}));

// Serve uploaded images statically (local dev fallback when S3 isn't configured)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// ───────────────────────────── Routes ────────────────────────────────

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/flash-sales', flashSaleRoutes);

// ───────────────────────────── 404 Handler ───────────────────────────

app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// ───────────────────────────── Error Handler ─────────────────────────

app.use(errorHandler);

module.exports = app;
