import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';

// 👇 Added `onTransactionAdded` back in so we can refresh the Dashboard!
const AddTransaction = ({ currentBalance, onTransactionAdded }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (transaction) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // TransactionForm already saved the data to the DB using the JWT token.
      // Now we just tell App.js to fetch the fresh data from the server!
      if (onTransactionAdded) {
        await onTransactionAdded(); 
      }
      
      // Send them back to the Dashboard
      navigate('/');
      
    } catch (err) {
      console.error('Error in navigation:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Transaction</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
      
      <div className="card">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <TransactionForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          currentBalance={currentBalance}
        />
      </div>
    </div>
  );
};

export default AddTransaction;