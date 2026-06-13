import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaWallet, FaFilter, FaEdit, FaChartPie, FaCheck, FaTimes, FaChartLine } from 'react-icons/fa';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import TopCategoriesChart from '../components/TopCategoriesChart';

const CATEGORY_MAPPING = {
  'Food': 'Needs', 'Housing': 'Needs', 'Utilities': 'Needs', 'Healthcare': 'Needs',
  'Transport': 'Needs', 'Education': 'Needs', 'Shopping': 'Wants', 'Entertainment': 'Wants',
  'Savings': 'Savings', 'Investment': 'Savings',
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
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [topCategories, setTopCategories] = useState([]);
  
  // 🔮 Rollover State Upgrades
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [rolloverAmount, setRolloverAmount] = useState(0);
  const [rolloverAllocations, setRolloverAllocations] = useState({ Needs: 0, Wants: 0, Savings: 0 });
  const [activeMonthRollovers, setActiveMonthRollovers] = useState({ Needs: 0, Wants: 0, Savings: 0 });

  // Dynamically calculate remaining amount in the modal
  const remainingRollover = rolloverAmount - (rolloverAllocations.Needs + rolloverAllocations.Wants + rolloverAllocations.Savings);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mappedData = res.data.map(item => ({
          ...item, id: item._id, title: item.text, amount: Math.abs(item.amount), date: item.date
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

      // Check if we already have saved custom allocations for this month
      const savedAllocations = localStorage.getItem(`rolloverAllocations_${currentMonthKey}`);
      if (savedAllocations) {
        setActiveMonthRollovers(JSON.parse(savedAllocations));
      }

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
          setRolloverAllocations({ Needs: lmBalance, Wants: 0, Savings: 0 }); // Default distribution
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
    if (remainingRollover !== 0) {
      alert(`You must allocate exactly Rs. ${rolloverAmount}. You have Rs. ${remainingRollover} left!`);
      return;
    }

    try {
      const newTx = {
        text: "Previous Month Rollover",
        amount: rolloverAmount,
        type: "income",
        category: "Other",
      };
      
      const token = localStorage.getItem('userToken');
      const res = await axios.post('http://localhost:5000/api/transactions', newTx, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedTx = { ...res.data, id: res.data._id, title: res.data.text, amount: Math.abs(res.data.amount), date: res.data.date };
      
      // ✅ Save Mam's custom distributions to local storage
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
      localStorage.setItem(`rolloverAllocations_${currentMonthKey}`, JSON.stringify(rolloverAllocations));
      setActiveMonthRollovers(rolloverAllocations);

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

  const predictedExpenses = useMemo(() => {
    const expenseTxs = transactions.filter(tx => tx.type === 'expense');
    if (expenseTxs.length === 0) return 0;
    const monthlyTotals = {};
    expenseTxs.forEach(tx => {
      const d = new Date(tx.date);
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + tx.amount;
    });
    const totalsArray = Object.values(monthlyTotals);
    const recentMonths = totalsArray.slice(-3);
    const sum = recentMonths.reduce((acc, val) => acc + val, 0);
    return sum / recentMonths.length;
  }, [transactions]); 

  useEffect(() => {
    if (isLoading) return;
    const income = filteredData.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredData.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

    setSummary({ totalIncome: income, totalExpenses: expenses, balance: income - expenses });

    const categoryMap = {};
    filteredData.filter(tx => tx.type === 'expense').forEach(tx => {
      if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
      categoryMap[tx.category] += tx.amount;
    });

    const categories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount).slice(0, 5);

    setTopCategories(categories);
  }, [filteredData, isLoading]);

  const budgetPercentage = Math.min((summary.totalExpenses / budgetLimit) * 100, 100);
  const getProgressBarColor = () => {
    if (budgetPercentage < 50) return 'bg-green-500';
    if (budgetPercentage < 85) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const actualSplit = useMemo(() => {
    const split = { Needs: 0, Wants: 0, Savings: 0 };
    filteredData.filter(tx => tx.type === 'expense').forEach(tx => {
      const bucket = CATEGORY_MAPPING[tx.category] || 'Wants'; 
      split[bucket] += tx.amount;
    });
    return split;
  }, [filteredData]);

  // 🎯 Target Calculations with Rollover Adjustments
  const rolloverIncomeTotal = filteredData
    .filter(tx => tx.title === "Previous Month Rollover" && tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const baseIncomeForTargets = summary.totalIncome - rolloverIncomeTotal;
  
  const targetNeeds = (baseIncomeForTargets * 0.50) + (activeMonthRollovers.Needs || 0);
  const targetWants = (baseIncomeForTargets * 0.30) + (activeMonthRollovers.Wants || 0);
  const targetSavings = (baseIncomeForTargets * 0.20) + (activeMonthRollovers.Savings || 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      
      {/* 🚀 UPGRADED: Mam's Custom Rollover Modal */}
      {showRolloverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl mx-4">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWallet size={30} />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Leftover Savings!</h2>
            <p className="text-gray-600 text-center mb-6 text-sm">
              You saved <span className="font-bold text-green-600">Rs. {rolloverAmount.toLocaleString()}</span> last month. Allocate these extra funds into your targets for this month:
            </p>

            <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-indigo-800">Needs target (+)</label>
                <input 
                  type="number" min="0" 
                  value={rolloverAllocations.Needs === 0 ? '' : rolloverAllocations.Needs} 
                  onChange={(e) => setRolloverAllocations({...rolloverAllocations, Needs: Number(e.target.value)})} 
                  className="w-24 p-2 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-pink-800">Wants target (+)</label>
                <input 
                  type="number" min="0" 
                  value={rolloverAllocations.Wants === 0 ? '' : rolloverAllocations.Wants} 
                  onChange={(e) => setRolloverAllocations({...rolloverAllocations, Wants: Number(e.target.value)})} 
                  className="w-24 p-2 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-emerald-800">Savings target (+)</label>
                <input 
                  type="number" min="0" 
                  value={rolloverAllocations.Savings === 0 ? '' : rolloverAllocations.Savings} 
                  onChange={(e) => setRolloverAllocations({...rolloverAllocations, Savings: Number(e.target.value)})} 
                  className="w-24 p-2 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className={`text-sm text-center font-bold ${remainingRollover === 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Remaining to allocate: Rs. {remainingRollover.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={closeRolloverModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <FaTimes className="mr-2" /> Skip
              </button>
              <button 
                onClick={handleAcceptRollover}
                disabled={remainingRollover !== 0}
                className={`px-6 py-2 text-white rounded-lg flex items-center shadow-md transition-all ${remainingRollover === 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
              >
                <FaCheck className="mr-2" /> Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Headers & Filters */}
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
                <span className="text-3xl font-bold text-gray-800 mr-2">Rs. {summary.totalExpenses.toLocaleString()}</span>
                <span className="text-gray-400 text-lg">
                   / 
                   {isEditingBudget ? (
                     <input 
                       type="number" value={budgetLimit} 
                       onChange={(e) => handleBudgetChange(Number(e.target.value))}
                       onBlur={() => setIsEditingBudget(false)} autoFocus
                       className="w-24 border-b-2 border-blue-500 focus:outline-none ml-1 text-gray-600"
                     />
                   ) : (
                     <span 
                       onClick={() => setIsEditingBudget(true)} 
                       className="cursor-pointer hover:text-blue-600 ml-1 border-b border-dashed border-gray-300"
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
        <SummaryCard title="Total Income" amount={summary.totalIncome.toFixed(2)} change={0} icon={FaArrowUp} trend="up" />
        <SummaryCard title="Total Expenses" amount={summary.totalExpenses.toFixed(2)} change={0} icon={FaArrowDown} trend="down" />
        <SummaryCard title={filterType === 'all' ? "Total Balance" : "Period Balance"} amount={summary.balance.toFixed(2)} change={0} icon={FaWallet} trend={summary.balance >= 0 ? 'up' : 'down'} />
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center"><FaChartLine className="mr-3" /> Predictive Expense Forecast</h2>
          <p className="text-purple-100 text-sm mt-1 max-w-lg">Based on a moving average algorithm of your historical transaction data, we project your baseline expenses for the upcoming month.</p>
        </div>
        <div className="text-left md:text-right bg-white bg-opacity-20 px-5 py-3 rounded-lg border border-purple-300 border-opacity-30">
          <p className="text-xs text-purple-100 uppercase font-bold tracking-wider mb-1">Expected Spend</p>
          <p className="text-2xl font-bold">Rs. {predictedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* 🚀 UPGRADED: Actual vs Ideal 50-30-20 Rule Splitter with Rollover Adjustments */}
      {summary.totalIncome > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4 text-gray-800">
            <FaChartPie className="text-blue-500 mr-2" size={20} />
            <h2 className="text-lg font-bold">50-30-20 Tracker (Ideal vs Actual)</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Track your real spending against the golden 50/30/20 rule. Targets include any leftover rollover funds you allocated!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
                    <p className="text-sm font-bold text-indigo-700">Rs. {targetNeeds.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full ${actualSplit.Needs > targetNeeds ? 'bg-red-500' : 'bg-indigo-600'}`} 
                  style={{ width: `${Math.min((actualSplit.Needs / targetNeeds) * 100, 100) || 0}%` }}
                ></div>
              </div>
            </div>

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
                    <p className="text-sm font-bold text-pink-700">Rs. {targetWants.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-pink-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full ${actualSplit.Wants > targetWants ? 'bg-red-500' : 'bg-pink-500'}`} 
                  style={{ width: `${Math.min((actualSplit.Wants / targetWants) * 100, 100) || 0}%` }}
                ></div>
              </div>
            </div>

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
                    <p className="text-sm font-bold text-emerald-700">Rs. {targetSavings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-full rounded-full bg-emerald-500`} 
                  style={{ width: `${Math.min((actualSplit.Savings / targetSavings) * 100, 100) || 0}%` }}
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