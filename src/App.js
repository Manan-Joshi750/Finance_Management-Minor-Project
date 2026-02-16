import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import FinancialGoals from './pages/FinancialGoals'; 

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔌 FETCH DATA from Backend (Source of Truth)
  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      
      // Transform data to match what Dashboard expects
      const formattedData = res.data.map(item => ({
        ...item,
        id: item._id,     // Dashboard might use 'id'
        title: item.text, // Dashboard might use 'title'
        amount: Math.abs(item.amount) 
      }));

      setTransactions(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setLoading(false);
    }
  };

  // Load data when App starts
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Recalculate Balance
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
            {/* Dashboard: Receives Database Data */}
            <Route 
              path="/" 
              element={loading ? <p>Loading...</p> : <Dashboard transactions={transactions} />} 
            />
            
            {/* Add Transaction: Refreshes data after adding */}
            <Route 
              path="/add" 
              element={
                <AddTransaction 
                  onTransactionAdded={fetchTransactions} // Pass refresh function
                  currentBalance={calculateCurrentBalance()} 
                />
              } 
            />
            
            {/* History: Manages its own data (Self-Contained) */}
            <Route 
              path="/history" 
              element={<TransactionHistory />} 
            />

            {/* Goals */}
            <Route 
              path="/goals" 
              element={<FinancialGoals transactions={transactions} />} 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;