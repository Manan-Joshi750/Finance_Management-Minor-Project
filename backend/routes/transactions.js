const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware'); // 👈 Import the security bouncer

// 1. GET ALL TRANSACTIONS (Now secured & filtered by user)
router.get('/', protect, async (req, res) => {
  try {
    // 👇 Only find transactions where the 'user' matches the logged-in person
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST A NEW TRANSACTION (Now attached to the user)
router.post('/', protect, async (req, res) => {
  const { text, amount, type, category, date } = req.body;

  try {
    const newTransaction = new Transaction({
      user: req.user.id, // 👈 Slap the user's nametag on it before saving!
      text,
      amount,
      type,
      category,
      date
    });
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. DELETE A TRANSACTION (Now strictly checked)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 👇 Ensure the person deleting this actually owns it!
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;