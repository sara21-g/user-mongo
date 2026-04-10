require('dotenv').config();
const dns = require('dns');
// Force public DNS resolvers ONLY locally to fix SRV lookup issues with MongoDB Atlas on Windows.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('../routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel Serverless MongoDB Connection Logic
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: '🚀 User Management API is running' });
});

// Ensure the server actually listens on ports for standard VPS/Local
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  });
}

// Export the app for Vercel Serverless
module.exports = app;
