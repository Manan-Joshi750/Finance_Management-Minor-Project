import React, { useState, useEffect } from 'react';
import { FaCar, FaHome, FaBullseye, FaPlus, FaTrash, FaWallet, FaTrophy } from 'react-icons/fa';

const FinancialGoals = ({ transactions }) => {
  // --- STATE ---
  const [monthlySavings, setMonthlySavings] = useState(0);
  
  // Load existing goals from local storage (or start empty)
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem('finTrack_goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  // Form State
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');

  // --- 1. CALCULATE AVERAGE MONTHLY SAVINGS (Your original logic!) ---
  useEffect(() => {
    if (transactions.length === 0) return;

    const monthlyStats = {};
    transactions.forEach(tx => {
      const month = tx.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyStats[month]) monthlyStats[month] = { income: 0, expense: 0 };
      
      if (tx.type === 'income') monthlyStats[month].income += tx.amount;
      else monthlyStats[month].expense += tx.amount;
    });

    const months = Object.keys(monthlyStats);
    let totalSavings = 0;
    let validMonths = 0;

    months.forEach(month => {
      const saving = monthlyStats[month].income - monthlyStats[month].expense;
      totalSavings += saving;
      validMonths++;
    });

    const avg = validMonths > 0 ? (totalSavings / validMonths) : 0;
    setMonthlySavings(avg > 0 ? avg : 0);
  }, [transactions]);

  // --- 2. SAVE GOALS TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('finTrack_goals', JSON.stringify(goals));
  }, [goals]);

  // --- 3. HANDLERS ---
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalAmount) return;

    const newGoal = {
      id: Date.now(),
      name: goalName,
      target: parseFloat(goalAmount),
      saved: currentSaved ? parseFloat(currentSaved) : 0
    };

    setGoals([...goals, newGoal]);
    
    // Reset Form
    setGoalName('');
    setGoalAmount('');
    setCurrentSaved('');
  };

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  // --- 4. PREDICTION HELPER MATH ---
  const calculatePace = (target, saved) => {
    if (monthlySavings <= 0) return null;
    const remaining = target - saved;
    if (remaining <= 0) return 'Goal Met! 🎉';

    const monthsNeeded = Math.ceil(remaining / monthlySavings);
    const futureDate = new Date(new Date().setMonth(new Date().getMonth() + monthsNeeded));
    
    return {
      months: monthsNeeded,
      date: futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  };

  return (
    <div className="space-y-8">
      {/* Header & Main Stat */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBullseye className="mr-2 text-red-600" /> Goal Tracker
          </h1>
          <p className="text-gray-500 mt-1">Set targets and let your real spending habits predict your success.</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-xl shadow-sm">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Your Avg. Monthly Savings</p>
          <p className="text-2xl font-bold text-blue-700">
            Rs. {monthlySavings.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Goal Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Create New Goal</h2>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Goal Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. New Car, Vacation"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                  />
                  <FaCar className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Target Amount (Rs)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    required
                  />
                  <FaHome className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Already Saved (Rs)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 5000 (Optional)"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentSaved}
                    onChange={(e) => setCurrentSaved(e.target.value)}
                  />
                  <FaWallet className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md flex justify-center items-center transition-all"
              >
                <FaPlus className="mr-2" /> Add Goal
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Display Active Goals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Your Active Goals</h2>
          
          {goals.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400">
              <FaTrophy className="text-5xl mb-4 text-gray-300" />
              <p>No goals set yet. Add one to start tracking!</p>
            </div>
          ) : (
            goals.map(goal => {
              const progressPct = Math.min((goal.saved / goal.target) * 100, 100);
              const pace = calculatePace(goal.target, goal.saved);
              
              return (
                <div key={goal.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                  {/* Delete Button */}
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete Goal"
                  >
                    <FaTrash />
                  </button>

                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{goal.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Rs. {goal.saved.toLocaleString()}</span> saved of Rs. {goal.target.toLocaleString()}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${progressPct === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>

                  {/* Pace Prediction Footer */}
                  <div className="bg-gray-50 -mx-6 -mb-6 mt-4 p-4 border-t flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {progressPct.toFixed(1)}% Completed
                    </span>
                    
                    <span className="text-sm font-semibold text-blue-600 flex items-center">
                      {pace === 'Goal Met! 🎉' ? (
                        <span className="text-green-600">{pace}</span>
                      ) : pace ? (
                        <>Est. {pace.date} <span className="text-xs text-gray-400 font-normal ml-2">({pace.months} months)</span></>
                      ) : (
                        <span className="text-orange-500 text-xs">Increase savings to predict!</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
      </div>
    </div>
  );
};

export default FinancialGoals;