import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

// Auth Pages (New!)
import Login from './components/Login';
import Register from './components/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import FinancialGoals from './pages/FinancialGoals'; 

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛡️ THE BOUNCER: Protects routes from unauthenticated users
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // 🔌 FETCH DATA from Backend (Now Secured with JWT!)
  const fetchTransactions = useCallback(async () => {
    const token = localStorage.getItem('userToken');
    
    // If no token, don't try to fetch data yet
    if (!token) {
      setLoading(false);
      return; 
    }

    try {
      const res = await axios.get('http://localhost:5000/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}` // 👈 Flashing the digital keycard to the backend
        }
      });
      
      // Transform data to match what Dashboard expects
      const formattedData = res.data.map(item => ({
        ...item,
        id: item._id,     
        title: item.text, 
        amount: Math.abs(item.amount) 
      }));

      setTransactions(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      // If the token is invalid or expired, log them out
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        window.location.href = '/login';
      }
      setLoading(false);
    }
  }, []);

  // Load data when App starts (or when fetchTransactions changes)
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Recalculate Balance
  const calculateCurrentBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' 
        ? acc + curr.amount 
        : acc - curr.amount;
    }, 0);
  };

  // Check token to decide whether to show Navbar
  const isAuthenticated = !!localStorage.getItem('userToken');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Only show Navbar if the user is logged in */}
        {isAuthenticated && <Navbar />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* 🔓 Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 Protected Routes (Wrapped in Bouncer) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  {loading ? <p>Loading...</p> : <Dashboard transactions={transactions} />}
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/add" 
              element={
                <ProtectedRoute>
                  <AddTransaction 
                    onTransactionAdded={fetchTransactions} 
                    currentBalance={calculateCurrentBalance()} 
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  {/* Note: In Phase 2, we will need to update axios inside this file too! */}
                  <TransactionHistory />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <FinancialGoals transactions={transactions} />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all: If route doesn't exist, send to Dashboard (which will redirect to login if needed) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;