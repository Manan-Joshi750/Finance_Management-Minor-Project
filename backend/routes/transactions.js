const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction'); // Ensure this path points to your model

// 1. GET all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }); // Newest first
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST a new transaction
router.post('/', async (req, res) => {
  const { text, amount, type, category, date } = req.body;

  try {
    const newTransaction = new Transaction({
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

// 3. DELETE a transaction (The New Feature!)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Transaction.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;