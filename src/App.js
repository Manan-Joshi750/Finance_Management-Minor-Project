import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './utils/api'; // 👈 NEW: Using centralized API instance
import Navbar from './components/Navbar';

// Auth Pages
import Login from './components/Login';
import Register from './components/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import FinancialGoals from './pages/FinancialGoals'; 
import About from './pages/About';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('userToken'));

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const fetchTransactions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return; 
    }

    try {
      // 👈 NEW: Uses the api instance and relative path
      const res = await api.get('/transactions', {
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
        setToken(null); 
      }
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
        {token && <Navbar setToken={setToken} />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register />} />

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