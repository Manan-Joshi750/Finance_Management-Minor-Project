import React, { useState } from 'react';
import axios from 'axios'; // 🔌 1. Import Axios

const TransactionForm = ({ onSubmit, initialData = {}, currentBalance = 0 }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    amount: initialData.amount || '',
    category: initialData.category || 'Food',
    type: initialData.type || 'expense',
    date: initialData.date || new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Food', 'Shopping', 'Transport', 'Housing', 'Entertainment', 
    'Utilities', 'Healthcare', 'Education', 'Salary', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => { // 🔌 2. Make this async
    e.preventDefault();

    // 🔌 3. Prepare data for MongoDB
    // We map 'title' -> 'text' because your Database expects 'text'
    // We also make expenses negative so calculations are easier later
    const transactionData = {
      text: formData.title, 
      amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount),
      category: formData.category,
      type: formData.type,
      date: formData.date
    };

    try {
      // 🚀 4. SEND TO CLOUD
      const res = await axios.post('http://localhost:5000/api/transactions', transactionData);
      
      console.log('✅ Saved to Cloud:', res.data);

      // Notify the parent component to update the list immediately
      if (onSubmit) {
        onSubmit(res.data);
      }
      
      // Reset form
      if (!initialData.id) {
        setFormData({
          title: '',
          amount: '',
          category: 'Food',
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        });
      }

    } catch (err) {
      console.error('❌ Error saving transaction:', err);
      alert('Failed to save. Is the Backend running?');
    }
  };

  // --- Calculation Logic for Smart Checker (Kept exactly as you had it) ---
  const transactionAmount = parseFloat(formData.amount) || 0;
  let projectedBalance = currentBalance;
  let isAffordable = true;

  if (formData.type === 'expense') {
    projectedBalance = currentBalance - transactionAmount;
    if (projectedBalance < 0) isAffordable = false;
  } else {
    projectedBalance = currentBalance + transactionAmount;
  }
  // ---------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- Smart Checker UI --- */}
      <div className={`p-4 rounded-lg border ${isAffordable ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Transaction Impact
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className="text-lg font-bold text-gray-800">
                    Rs. {currentBalance.toFixed(2)}
                </p>
            </div>
            <div>
                <p className="text-xs text-gray-500">After Transaction</p>
                <p className={`text-lg font-bold ${
                    !isAffordable ? 'text-red-600' : 
                    formData.type === 'income' ? 'text-green-600' : 'text-blue-600'
                }`}>
                    Rs. {projectedBalance.toFixed(2)}
                </p>
            </div>
        </div>
        {!isAffordable && (
            <div className="mt-3 text-sm text-red-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Warning: Insufficient funds for this expense!
            </div>
        )}
      </div>
      {/* ---------------------------- */}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="input-field mt-1"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">Rs. </span>
          </div>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="input-field pl-7"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field mt-1"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input-field mt-1"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setFormData({
              title: '',
              amount: '',
              category: 'Food',
              type: 'expense',
              date: new Date().toISOString().split('T')[0]
            });
          }}
        >
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData.id ? 'Update' : 'Add'} Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
