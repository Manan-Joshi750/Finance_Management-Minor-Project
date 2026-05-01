import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaWallet, FaFilter, FaEdit, FaChartPie, FaCheck, FaTimes } from 'react-icons/fa';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import TopCategoriesChart from '../components/TopCategoriesChart';

// 🧠 THE BRAIN: Perfectly mapped to your TransactionForm.js categories!
const CATEGORY_MAPPING = {
  // NEEDS (50%)
  'Food': 'Needs',
  'Housing': 'Needs',
  'Utilities': 'Needs',
  'Healthcare': 'Needs',
  'Transport': 'Needs',
  'Education': 'Needs',
  
  // WANTS (30%)
  'Shopping': 'Wants',
  'Entertainment': 'Wants',
  
  // SAVINGS/INVESTMENTS (20%)
  'Savings': 'Savings',
  'Investment': 'Savings',
  
  // 'Other' and 'Salary' will default to 'Wants' in our fallback logic if they are marked as an expense.
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('thisMonth'); 
  const [budgetLimit, setBudgetLimit] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? JSON.parse(saved) : 20000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [topCategories, setTopCategories] = useState([]);
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [rolloverAmount, setRolloverAmount] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // 👇 GRABBING THE TOKEN
        const token = localStorage.getItem('userToken');
        
        // 👇 ATTACHING THE VIP PASS (TOKEN) TO THE REQUEST
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const mappedData = res.data.map(item => ({
          ...item,
          id: item._id,    
          title: item.text, 
          amount: Math.abs(item.amount), 
          date: item.date
        }));
        
        setTransactions(mappedData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (isLoading || transactions.length === 0) return;

    const checkRollover = () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
      const lastSeenMonthKey = localStorage.getItem('lastSeenMonth');

      if (lastSeenMonthKey && lastSeenMonthKey !== currentMonthKey) {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

        const lastMonthTx = transactions.filter(tx => {
          const d = new Date(tx.date);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        const lmIncome = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const lmExpense = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const lmBalance = lmIncome - lmExpense;

        if (lmBalance > 0) {
          setRolloverAmount(lmBalance);
          setShowRolloverModal(true);
        } else {
          localStorage.setItem('lastSeenMonth', currentMonthKey);
        }
      } else if (!lastSeenMonthKey) {
        localStorage.setItem('lastSeenMonth', currentMonthKey);
      }
    };

    checkRollover();
  }, [isLoading, transactions]);

  const handleAcceptRollover = async () => {
    try {
      const newTx = {
        text: "Previous Month Rollover",
        amount: rolloverAmount,
        type: "income",
        category: "Other",
      };
      
      // 👇 GRABBING THE TOKEN FOR THE ROLLOVER POST REQUEST
      const token = localStorage.getItem('userToken');
      
      const res = await axios.post('http://localhost:5000/api/transactions', newTx, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const mappedTx = { ...res.data, id: res.data._id, title: res.data.text, amount: Math.abs(res.data.amount), date: res.data.date };
      setTransactions(prev => [...prev, mappedTx]);
      closeRolloverModal();
    } catch (error) {
      console.error("Error adding rollover:", error);
    }
  };

  const closeRolloverModal = () => {
    setShowRolloverModal(false);
    const now = new Date();
    localStorage.setItem('lastSeenMonth', `${now.getFullYear()}-${now.getMonth()}`);
  };

  const handleBudgetChange = (amount) => {
    setBudgetLimit(amount);
    localStorage.setItem('monthlyBudget', JSON.stringify(amount));
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      if (filterType === 'all') return true;
      if (filterType === 'thisMonth') return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      if (filterType === 'lastMonth') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return txDate.getMonth() === lastMonthDate.getMonth() && txDate.getFullYear() === lastMonthDate.getFullYear();
      }
      return true;
    });
  }, [transactions, filterType]);

  useEffect(() => {
    if (isLoading) return;

    const income = filteredData.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredData.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

    setSummary({
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    });

    const categoryMap = {};
    filteredData.filter(tx => tx.type === 'expense').forEach(tx => {
      if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
      categoryMap[tx.category] += tx.amount;
    });

    const categories = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setTopCategories(categories);
  }, [filteredData, isLoading]);

  const budgetPercentage = Math.min((summary.totalExpenses / budgetLimit) * 100, 100);
  const getProgressBarColor = () => {
    if (budgetPercentage < 50) return 'bg-green-500';
    if (budgetPercentage < 85) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  // 📊 Calculate Actual 50-30-20 Split
  const actualSplit = useMemo(() => {
    const split = { Needs: 0, Wants: 0, Savings: 0 };
    
    // We only categorize expenses for this rule
    filteredData.filter(tx => tx.type === 'expense').forEach(tx => {
      const bucket = CATEGORY_MAPPING[tx.category] || 'Wants'; // Default unmapped to Wants
      split[bucket] += tx.amount;
    });
    
    return split;
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      
      {showRolloverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl text-center mx-4">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWallet size={30} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">New Month, New Goals!</h2>
            <p className="text-gray-600 mb-6">
              You saved <span className="font-bold text-green-600">Rs. {rolloverAmount.toLocaleString()}</span> last month. Do you want to carry this over as your starting balance for this month?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={closeRolloverModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FaTimes className="mr-2" /> No Thanks
              </button>
              <button 
                onClick={handleAcceptRollover}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg shadow-blue-200"
              >
                <FaCheck className="mr-2" /> Add to Balance
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <FaFilter className="text-gray-400 mr-2" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {filterType !== 'all' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Monthly Budget Goal</h2>
              <div className="flex items-center mt-1">
                <span className="text-3xl font-bold text-gray-800 mr-2">
                   Rs. {summary.totalExpenses.toLocaleString()}
                </span>
                <span className="text-gray-400 text-lg">
                   / 
                   {isEditingBudget ? (
                     <input 
                       type="number" 
                       value={budgetLimit} 
                       onChange={(e) => handleBudgetChange(Number(e.target.value))}
                       onBlur={() => setIsEditingBudget(false)}
                       autoFocus
                       className="w-24 border-b-2 border-blue-500 focus:outline-none ml-1 text-gray-600"
                     />
                   ) : (
                     <span 
                       onClick={() => setIsEditingBudget(true)} 
                       className="cursor-pointer hover:text-blue-600 ml-1 border-b border-dashed border-gray-300"
                       title="Click to edit budget"
                     >
                       Rs. {budgetLimit.toLocaleString()} <FaEdit className="inline w-3 h-3 mb-1"/>
                     </span>
                   )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold ${budgetPercentage > 85 ? 'text-red-500' : 'text-gray-600'}`}>
                {budgetPercentage.toFixed(1)}% Used
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${getProgressBarColor()}`} 
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
          
          <div className="mt-2 text-xs text-gray-400 flex justify-between">
            <span>Rs. 0</span>
            <span>{budgetPercentage >= 100 ? 'Budget Exceeded!' : `Rs. ${(budgetLimit - summary.totalExpenses).toLocaleString()} remaining`}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total Income" 
          amount={summary.totalIncome.toFixed(2)} 
          change={0} 
          icon={FaArrowUp} 
          trend="up" 
        />
        <SummaryCard 
          title="Total Expenses" 
          amount={summary.totalExpenses.toFixed(2)} 
          change={0} 
          icon={FaArrowDown} 
          trend="down" 
        />
        <SummaryCard 
          title={filterType === 'all' ? "Total Balance" : "Period Balance"}
          amount={summary.balance.toFixed(2)} 
          change={0} 
          icon={FaWallet} 
          trend={summary.balance >= 0 ? 'up' : 'down'} 
        />
      </div>

      {/* 🚀 UPGRADED: Actual vs Ideal 50-30-20 Rule Splitter */}
      {summary.totalIncome > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-800">
            <FaChartPie className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-bold">50-30-20 Tracker (Ideal vs Actual)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Track your real spending habits against the golden 50/30/20 rule.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* NEEDS CARD */}
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-indigo-800 font-bold mb-1">Needs (50%)</h3>
                <p className="text-xs text-indigo-600 mb-4">Housing, Food, Transport, etc.</p>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Actual</p>
                    <p className="text-xl font-bold text-indigo-900">Rs. {actualSplit.Needs.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Target</p>
                    <p className="text-sm font-bold text-indigo-700">Rs. {(summary.totalIncome * 0.50).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full ${actualSplit.Needs > (summary.totalIncome * 0.50) ? 'bg-red-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${Math.min((actualSplit.Needs / (summary.totalIncome * 0.50)) * 100, 100) || 0}%` }}
                ></div>
              </div>
            </div>

            {/* WANTS CARD */}
            <div className="p-5 bg-pink-50 border border-pink-100 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-pink-800 font-bold mb-1">Wants (30%)</h3>
                <p className="text-xs text-pink-600 mb-4">Shopping, Entertainment, etc.</p>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Actual</p>
                    <p className="text-xl font-bold text-pink-900">Rs. {actualSplit.Wants.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-pink-400 uppercase font-bold tracking-wider">Target</p>
                    <p className="text-sm font-bold text-pink-700">Rs. {(summary.totalIncome * 0.30).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-pink-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full ${actualSplit.Wants > (summary.totalIncome * 0.30) ? 'bg-red-500' : 'bg-pink-500'}`} 
                  style={{ width: `${Math.min((actualSplit.Wants / (summary.totalIncome * 0.30)) * 100, 100) || 0}%` }}
                ></div>
              </div>
            </div>

            {/* SAVINGS CARD */}
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-emerald-800 font-bold mb-1">Savings (20%)</h3>
                <p className="text-xs text-emerald-600 mb-4">Investments & Saved Income</p>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Actual</p>
                    <p className="text-xl font-bold text-emerald-900">Rs. {actualSplit.Savings.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Target</p>
                    <p className="text-sm font-bold text-emerald-700">Rs. {(summary.totalIncome * 0.20).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full bg-emerald-500`} 
                  style={{ width: `${Math.min((actualSplit.Savings / (summary.totalIncome * 0.20)) * 100, 100) || 0}%` }}
                ></div>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <TransactionTable transactions={filteredData.slice(0, 5)} showCategory={true} />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <TopCategoriesChart data={topCategories} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;