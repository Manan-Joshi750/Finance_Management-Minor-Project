import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowUp, FaArrowDown, FaWallet, FaFilter, FaEdit } from 'react-icons/fa';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import TopCategoriesChart from '../components/TopCategoriesChart';

const Dashboard = ({ transactions = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('thisMonth'); // 'all', 'thisMonth', 'lastMonth'
  const [budgetLimit, setBudgetLimit] = useState(20000); // Default monthly budget
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [topCategories, setTopCategories] = useState([]);

  // --- Filter Logic (Fixed Warning) ---
  const filteredData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      if (filterType === 'all') return true;
      
      if (filterType === 'thisMonth') {
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      }
      
      if (filterType === 'lastMonth') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return txDate.getMonth() === lastMonthDate.getMonth() && 
               txDate.getFullYear() === lastMonthDate.getFullYear();
      }
      return true;
    });
  }, [transactions, filterType]); // Dependencies are now correct

  // --- Calculations ---
  useEffect(() => {
    // Simulate API delay for realism
    const timer = setTimeout(() => {
      const income = filteredData
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenses = filteredData
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      setSummary({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
      });

      // Calculate top categories for the filtered period
      const categoryMap = {};
      filteredData
        .filter(tx => tx.type === 'expense')
        .forEach(tx => {
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
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filteredData]);

  // --- Budget Progress Logic ---
  const budgetPercentage = Math.min((summary.totalExpenses / budgetLimit) * 100, 100);
  
  // Determine color based on percentage
  const getProgressBarColor = () => {
    if (budgetPercentage < 50) return 'bg-green-500';
    if (budgetPercentage < 85) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Time Filter Dropdown */}
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

      {/* --- BUDGET TRACKER SECTION --- */}
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
                       onChange={(e) => setBudgetLimit(Number(e.target.value))}
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

          {/* Progress Bar Container */}
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

      {/* Summary Cards */}
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

      {/* Charts and Recent Transactions */}
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