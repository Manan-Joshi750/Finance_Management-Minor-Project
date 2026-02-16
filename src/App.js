import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import FinancialGoals from './pages/FinancialGoals'; // <--- IMPORT NEW PAGE
import Navbar from './components/Navbar';

// Initial mock data
const initialTransactions = [
  // November 2025 - Current Month
  { id: 1, title: 'Grocery Shopping', amount: 125.75, category: 'Food', type: 'expense', date: '2025-11-05' },
  { id: 2, title: 'Freelance Work', amount: 1200.00, category: 'Salary', type: 'income', date: '2025-11-03' },
  { id: 3, title: 'Electric Bill', amount: 78.90, category: 'Utilities', type: 'expense', date: '2025-11-01' },
  { id: 4, title: 'New Laptop', amount: 899.99, category: 'Electronics', type: 'expense', date: '2025-11-02' },
  { id: 5, title: 'Restaurant Dinner', amount: 65.50, category: 'Food', type: 'expense', date: '2025-11-04' },
  { id: 6, title: 'Gym Membership', amount: 45.00, category: 'Health', type: 'expense', date: '2025-11-01' },
  { id: 7, title: 'Uber Rides', amount: 32.75, category: 'Transport', type: 'expense', date: '2025-11-06' },
  
  // October 2025
  { id: 8, title: 'Salary', amount: 3200.00, category: 'Salary', type: 'income', date: '2025-10-30' },
  { id: 9, title: 'Rent Payment', amount: 1200.00, category: 'Housing', type: 'expense', date: '2025-10-28' },
  { id: 10, title: 'Internet Bill', amount: 64.99, category: 'Utilities', type: 'expense', date: '2025-10-25' },
  { id: 11, title: 'Supermarket', amount: 187.30, category: 'Food', type: 'expense', date: '2025-10-20' },
  { id: 12, title: 'Movie Night', amount: 28.50, category: 'Entertainment', type: 'expense', date: '2025-10-18' },
  { id: 13, title: 'Freelance Project', amount: 850.00, category: 'Salary', type: 'income', date: '2025-10-15' },
  { id: 14, title: 'Car Insurance', amount: 125.00, category: 'Transport', type: 'expense', date: '2025-10-10' },
  { id: 15, title: 'Dentist Visit', amount: 150.00, category: 'Healthcare', type: 'expense', date: '2025-10-05' },
  { id: 16, title: 'Amazon Purchase', amount: 89.99, category: 'Shopping', type: 'expense', date: '2025-10-01' },
];

// Load transactions from localStorage or use initial data
const loadTransactions = () => {
  try {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  } catch (error) {
    console.error('Failed to load transactions:', error);
    return initialTransactions;
  }
};

function App() {
  const [transactions, setTransactions] = useState(loadTransactions);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }, [transactions]);

  // Function to add a new transaction (Single)
  const addTransaction = (newTransaction) => {
    setTransactions(prevTransactions => [
      {
        ...newTransaction,
        id: Date.now(), // Generate a unique ID
        amount: parseFloat(newTransaction.amount) // Ensure amount is a number
      },
      ...prevTransactions // Add new transaction to the beginning
    ]);
  };

  // Function to Import Multiple Transactions (Bulk)
  const importTransactions = (newTransactionsArray) => {
    setTransactions(prevTransactions => [
      ...newTransactionsArray, 
      ...prevTransactions      
    ]);
  };

  // --- DELETE FUNCTION ---
  const deleteTransaction = (idToDelete) => {
    setTransactions(prevTransactions => 
      prevTransactions.filter(transaction => transaction.id !== idToDelete)
    );
  };

  // Helper to calculate current balance
  const calculateCurrentBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' 
        ? acc + curr.amount 
        : acc - curr.amount;
    }, 0);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            
            {/* Add Transaction (Updated path to match Navbar) */}
            <Route 
              path="/add" 
              element={
                <AddTransaction 
                  onAddTransaction={addTransaction} 
                  currentBalance={calculateCurrentBalance()} 
                />
              } 
            />
            
            {/* Transaction History (Updated path to match Navbar) */}
            <Route 
              path="/history" 
              element={
                <TransactionHistory 
                   transactions={transactions} 
                   onImport={importTransactions} 
                   onDelete={deleteTransaction}
                />
              } 
            />

            {/* NEW: Financial Goals Route */}
            <Route 
              path="/goals" 
              element={<FinancialGoals transactions={transactions} />} 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;