const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // 👇 THE NEW UPGRADE: Tying this transaction to a specific User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // This links directly to the User.js model we just created
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative number']
  },
  type: {
    type: String,
    enum: ['income', 'expense'], 
    required: true
  },
  category: {
    type: String,
    default: 'Other' // 👈 Changed from 'General' to 'Other' for consistency
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);