const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const transactionRoutes = require('./routes/transactions');
const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

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