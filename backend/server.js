const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');
const userRoutes = require('./routes/userRoutes'); // 👈 NEW: Import User Routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes); // 👈 NEW: Activate User Routes

// 🔌 Connect to MongoDB (The Magic Line)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('🚀 Finance Manager Backend is Running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});