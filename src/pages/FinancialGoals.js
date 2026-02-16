import React, { useState, useEffect } from 'react';
import { FaCar, FaHome, FaCalculator, FaBullseye } from 'react-icons/fa';

const FinancialGoals = ({ transactions }) => {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [prediction, setPrediction] = useState(null);

  // 1. Calculate Average Monthly Savings from History
  useEffect(() => {
    if (transactions.length === 0) return;

    // Group by month (e.g., "2025-02")
    const monthlyStats = {};
    
    transactions.forEach(tx => {
      const month = tx.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyStats[month]) monthlyStats[month] = { income: 0, expense: 0 };
      
      if (tx.type === 'income') monthlyStats[month].income += tx.amount;
      else monthlyStats[month].expense += tx.amount;
    });

    // Calculate savings for each month
    const months = Object.keys(monthlyStats);
    let totalSavings = 0;
    let validMonths = 0;

    months.forEach(month => {
      const saving = monthlyStats[month].income - monthlyStats[month].expense;
      totalSavings += saving;
      validMonths++;
    });

    // Average Savings (Prevent negative numbers for prediction base)
    const avg = validMonths > 0 ? (totalSavings / validMonths) : 0;
    setMonthlySavings(avg > 0 ? avg : 0);

  }, [transactions]);

  // 2. The Prediction Algorithm
  const handlePredict = (e) => {
    e.preventDefault();
    if (!goalAmount || monthlySavings <= 0) return;

    const monthsNeeded = Math.ceil(parseFloat(goalAmount) / monthlySavings);
    
    // Calculate the future date
    const today = new Date();
    const futureDate = new Date(today.setMonth(today.getMonth() + monthsNeeded));
    
    setPrediction({
      months: monthsNeeded,
      date: futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: parseFloat(goalAmount)
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center">
        <FaBullseye className="mr-2 text-red-600" /> Purchase Predictor
      </h1>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: The Calculator Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaCalculator className="mr-2 text-blue-600" /> Set a Goal
          </h2>
          
          <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              Based on your transaction history, your average savings rate is:
            </p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              Rs. {monthlySavings.toFixed(2)} <span className="text-sm font-normal text-gray-600">/ month</span>
            </p>
            {monthlySavings <= 0 && (
              <p className="text-xs text-red-500 mt-2">
                * You need positive savings to generate a prediction. Try adding some income!
              </p>
            )}
          </div>

          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Goal Name</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="e.g. Tesla Model 3, Dream Home"
                  className="input-field w-full pl-10"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                />
                <FaCar className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Target Amount (Rs)</label>
              <div className="relative mt-1">
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  className="input-field w-full pl-10"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  required
                />
                <FaHome className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={monthlySavings <= 0}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                monthlySavings > 0 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Predict Timeline
            </button>
          </form>
        </div>

        {/* Right: The Prediction Result */}
        <div className="flex flex-col gap-6">
            {prediction ? (
            <div className="card p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col justify-center items-center text-center shadow-xl animate-fade-in">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg text-2xl">
                🚀
              </div>
              <h3 className="text-2xl font-bold mb-2">Goal: {goalName}</h3>
              <p className="text-gray-300 mb-6">Target: Rs. {prediction.amount.toLocaleString()}</p>
              
              <div className="bg-white/10 p-6 rounded-xl w-full backdrop-blur-sm border border-white/20">
                <p className="text-sm text-gray-300 uppercase tracking-wider mb-1">Estimated Completion</p>
                <p className="text-3xl font-extrabold text-green-400">{prediction.date}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Just <span className="text-white font-bold">{prediction.months} months</span> to go!
                </p>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                *Prediction assumes your monthly savings remain constant at Rs. {monthlySavings.toFixed(0)}.
              </p>
            </div>
            ) : (
            <div className="card p-8 flex flex-col justify-center items-center text-center text-gray-400 h-full border-2 border-dashed border-gray-200">
                <FaCalculator className="text-6xl mb-4 text-gray-200" />
                <p>Enter your goal details to see your financial timeline.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FinancialGoals;