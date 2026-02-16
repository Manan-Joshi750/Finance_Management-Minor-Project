import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaDownload, FaFileUpload, FaTrash, FaMagic } from 'react-icons/fa';
import { parseSMS } from '../utils/smsParser'; // Import the parser we just made

const TransactionHistory = ({ transactions = [], onImport, onDelete }) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // --- NEW: SMS Modal State ---
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsText, setSmsText] = useState('');
  
  // Hidden input reference for file upload
  const fileInputRef = useRef(null);

  // Initialize filtered transactions
  useEffect(() => {
    if (transactions) {
      setFilteredTransactions(transactions);
      setIsLoading(false);
    }
  }, [transactions]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...transactions];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.title.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(tx => tx.type === filters.type);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(tx => tx.category === filters.category);
    }

    // Apply date range filter
    if (filters.startDate) {
      result = result.filter(tx => tx.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter(tx => tx.date <= filters.endDate);
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredTransactions(result);
  }, [transactions, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- DELETE FEATURE ---
  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction? This cannot be undone.")) {
      onDelete(id);
    }
  };

  // --- NEW: SMART SMS PARSER HANDLER ---
  const handleSMSParse = () => {
    const result = parseSMS(smsText);
    if (result && result.amount > 0) {
      // Create the transaction object
      const newTx = {
        id: Date.now(),
        ...result
      };
      
      // Confirm with user before adding
      if(window.confirm(`Parsed Transaction:\nTitle: ${newTx.title}\nAmount: ${newTx.amount}\nType: ${newTx.type}\n\nAdd this?`)) {
        onImport([newTx]); // Re-use existing import logic
        setSmsText('');
        setShowSMSModal(false);
      }
    } else {
      alert("Could not understand that SMS. Make sure it contains 'Rs' and 'debited/credited'.");
    }
  };

  // --- EXPORT TO CSV FEATURE ---
  const downloadCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
    const csvRows = filteredTransactions.map(tx => {
      const dateStr = tx.date; 
      return [
        `"${dateStr}"`,
        `"${tx.title}"`,
        `"${tx.category}"`,
        `"${tx.type}"`,
        `"${tx.amount}"`
      ].join(',');
    });
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'finance_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- IMPORT CSV FEATURE ---
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      try {
        const lines = text.split('\n');
        const newTransactions = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
            
            if (columns.length >= 5) {
              const tx = {
                id: Date.now() + i, 
                date: columns[0],   
                title: columns[1],  
                category: columns[2], 
                type: columns[3].toLowerCase(), 
                amount: parseFloat(columns[4]) 
              };
              
              if (tx.title && !isNaN(tx.amount)) {
                newTransactions.push(tx);
              }
            }
          }
        }
        
        if (newTransactions.length > 0) {
          onImport(newTransactions);
          alert(`Successfully imported ${newTransactions.length} transactions!`);
        } else {
          alert("No valid transactions found in the file.");
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error parsing file. Please ensure it is a valid CSV.");
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (error) {
      return 'Error';
    }
  };

  const categories = [...new Set(transactions.map(tx => tx.category))].filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10 w-full"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* NEW: Smart SMS Button */}
          <button 
            onClick={() => setShowSMSModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <FaMagic className="mr-2" /> AI Scan
          </button>

          {/* Import Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <FaFileUpload className="mr-2" /> Import CSV
          </button>

          {/* Export Button */}
          <button 
            onClick={downloadCSV}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <FaDownload className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <h2 className="text-lg font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field w-full"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field w-full"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="input-field w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="input-field w-full"
              min={filters.startDate}
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Description
                    {sortConfig.key === 'title' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.key === 'category' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.key === 'amount' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td 
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}Rs. {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Transaction"
                        >
                          <FaTrash />
                        </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW: SMS Parser Modal --- */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaMagic className="text-purple-600 mr-2" /> Parse Transaction
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Paste a bank SMS below (e.g., "Rs 500 debited for Coffee at Starbucks").
            </p>
            <textarea 
              className="w-full border rounded p-2 h-32 mb-4"
              placeholder="Paste SMS here..."
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSMSModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSMSParse}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Auto-Detect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;