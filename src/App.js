import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';

// Auth Pages
import Login from './components/Login';
import Register from './components/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import FinancialGoals from './pages/FinancialGoals'; 
import About from './pages/About'; // 👈 NEW: Imported the About page

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  // 🔑 Centralized Token State to handle live reactive updates across components
  const [token, setToken] = useState(localStorage.getItem('userToken'));

  // 🛡️ THE BOUNCER: Protects routes from unauthenticated users
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // 🔌 FETCH DATA from Backend
  const fetchTransactions = useCallback(async () => {
    // If no token, don't try to fetch data yet
    if (!token) {
      setLoading(false);
      return; 
    }

    try {
      const res = await axios.get('http://localhost:5000/api/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        setToken(null); // Clear state instantly
      }
      setLoading(false);
    }
  }, [token]);

  // Load data when App starts or when token changes
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Reactive Evaluation: Navbar appears/disappears instantly on token change */}
        {token && <Navbar setToken={setToken} />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* 🔓 Public Routes */}
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 Protected Routes */}
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
                    // Pass token down if needed or use from localStorage
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
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

            {/* 👈 NEW: Protected About Route */}
            <Route 
              path="/about" 
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;