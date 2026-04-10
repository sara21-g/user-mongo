require('dotenv').config();
const dns = require('dns');
// Force public DNS resolvers to fix SRV lookup issues with MongoDB Atlas
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 User Management System API is running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
    },
  });
});

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
