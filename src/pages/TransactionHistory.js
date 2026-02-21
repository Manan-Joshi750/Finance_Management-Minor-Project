import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaDownload, FaFileUpload, FaTrash, FaMagic, FaChevronDown } from 'react-icons/fa';
import { parseSMS } from '../utils/smsParser'; 

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
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
  
  // Export Dropdown State
  const [showExportMenu, setShowExportMenu] = useState(false);

  // SMS Modal State
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsText, setSmsText] = useState('');
  
  const fileInputRef = useRef(null);

  // 🔌 FETCH DATA FROM BACKEND
  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      
      const mappedData = res.data.map(item => ({
        ...item,
        id: item._id,     
        title: item.text, 
        amount: Math.abs(item.amount) 
      }));

      setTransactions(mappedData);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    let result = [...transactions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx => 
        (tx.title && tx.title.toLowerCase().includes(term)) ||
        (tx.category && tx.category.toLowerCase().includes(term)) ||
        tx.amount.toString().includes(term)
      );
    }

    if (filters.type !== 'all') {
      result = result.filter(tx => tx.type === filters.type);
    }

    if (filters.category !== 'all') {
      result = result.filter(tx => tx.category === filters.category);
    }

    if (filters.startDate) {
      result = result.filter(tx => tx.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter(tx => tx.date <= filters.endDate);
    }

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

  // 🔌 DELETE FROM BACKEND
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`);
        setTransactions(transactions.filter(tx => tx.id !== id));
      } catch (err) {
        console.error("Error deleting transaction:", err);
        alert("Failed to delete transaction.");
      }
    }
  };

  // 🔌 SAVE IMPORTED DATA TO BACKEND
  const saveImportedTransactions = async (newTransactions) => {
    try {
      const promises = newTransactions.map(tx => {
        const backendTx = {
            text: tx.title,
            amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
            category: tx.category,
            type: tx.type,
            date: tx.date
        };
        return axios.post('http://localhost:5000/api/transactions', backendTx);
      });

      await Promise.all(promises);
      alert(`Successfully saved ${newTransactions.length} transactions to database!`);
      fetchTransactions(); 
    } catch (err) {
        console.error("Error saving imports:", err);
        alert("Error saving some transactions to the database.");
    }
  };

  const handleSMSParse = () => {
    const result = parseSMS(smsText);
    if (result && result.amount > 0) {
      const newTx = {
        id: Date.now(),
        ...result,
        date: new Date().toISOString().split('T')[0]
      };
      
      if(window.confirm(`Parsed:\n${newTx.title}\nAmount: ${newTx.amount}\n\nAdd this?`)) {
        saveImportedTransactions([newTx]);
        setSmsText('');
        setShowSMSModal(false);
      }
    } else {
      alert("Could not understand that text.");
    }
  };

  // EXPORT CSV
  const downloadCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Type', 'Amount'];
    const csvRows = filteredTransactions.map(tx => {
      const dateStr = tx.date ? new Date(tx.date).toLocaleDateString() : ''; 
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

  // EXPORT JSON
  const downloadJSON = () => {
    const exportData = filteredTransactions.map(tx => ({
      Date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
      Title: tx.title,
      Category: tx.category,
      Type: tx.type,
      Amount: tx.amount
    }));
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'finance_report.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // MULTI-FORMAT IMPORT 
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      let newTransactions = [];

      try {
        if (fileExtension === 'csv') {
          // Parse CSV
          const lines = text.split('\n');
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
              if (columns.length >= 5) {
                 let dateVal = columns[0];
                 if(dateVal === 'Invalid Date' || !dateVal) dateVal = new Date().toISOString().split('T')[0];
                 else {
                     try { dateVal = new Date(dateVal).toISOString().split('T')[0]; } catch(err){}
                 }
                const tx = {
                  date: dateVal,   
                  title: columns[1],  
                  category: columns[2], 
                  type: columns[3].toLowerCase(), 
                  amount: parseFloat(columns[4]) 
                };
                if (tx.title && !isNaN(tx.amount)) newTransactions.push(tx);
              }
            }
          }
        } else if (fileExtension === 'json') {
          // Parse JSON
          const parsedData = JSON.parse(text);
          const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
          
          newTransactions = dataArray.map(item => {
            let dateVal = item.date || item.Date;
            if(dateVal === 'Invalid Date' || !dateVal) dateVal = new Date().toISOString().split('T')[0];
            else {
                try { dateVal = new Date(dateVal).toISOString().split('T')[0]; } catch(err){}
            }
            return {
              date: dateVal,
              title: item.title || item.Title || item.description || item.Description,
              category: item.category || item.Category,
              type: (item.type || item.Type || 'expense').toLowerCase(),
              amount: parseFloat(item.amount || item.Amount)
            };
          }).filter(tx => tx.title && !isNaN(tx.amount));
        } else {
          alert("Unsupported file format. Please upload a .csv or .json file.");
          return;
        }

        if (newTransactions.length > 0) {
          saveImportedTransactions(newTransactions); 
        } else {
          alert("No valid transactions found in the file.");
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Error parsing file. Please check the format.");
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          
          {/* AI Scan Button */}
          <button 
            onClick={() => setShowSMSModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <FaMagic className="mr-2" /> AI Scan
          </button>

          {/* Import Button (Single Button handling both CSV and JSON!) */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, .json" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <FaFileUpload className="mr-2" /> Import
          </button>

          {/* Single Dropdown Export Button */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <FaDownload className="mr-2" /> Export <FaChevronDown className="ml-2 text-xs" />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => { downloadCSV(); setShowExportMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => { downloadJSON(); setShowExportMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Filters Area */}
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

      {/* SMS Parser Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FaMagic className="text-purple-600 mr-2" /> Parse Transaction Text
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Paste a bank SMS or text block from a PDF below.
            </p>
            <textarea 
              className="w-full border rounded p-2 h-32 mb-4"
              placeholder="Paste text here..."
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