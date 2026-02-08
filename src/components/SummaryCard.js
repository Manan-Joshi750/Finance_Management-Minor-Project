import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const SummaryCard = ({ title, amount, change, icon, trend }) => {
  const Icon = icon;
  const isPositive = trend === 'up';
  
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">Rs. {Number(amount).toLocaleString()}</p>
          
          {/* Only show trend if change is greater than 0, otherwise it looks cluttered */}
          {change > 0 && (
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              <span>{change}% from last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;