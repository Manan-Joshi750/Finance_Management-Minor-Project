import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaWallet, FaChartPie, FaList, FaPlus, FaBullseye, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // <-- NEW: Allows us to trigger redirects
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to check if a link is active
  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-blue-100 text-blue-800 font-bold"  
      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600";
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // 🚪 NEW: The Logout Logic
  const handleLogout = () => {
    // 1. Shred the VIP pass
    localStorage.removeItem('userToken');
    
    // 2. Optional: Clear out other user-specific data so a new user starts fresh
    // localStorage.removeItem('monthlyBudget'); 
    // localStorage.removeItem('lastSeenMonth');
    
    // 3. Kick the user back to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
              <FaWallet />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-wide">FinTrack</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={`px-4 py-2 rounded-md text-sm transition-all duration-200 flex items-center ${isActive('/')}`}>
              <FaChartPie className="mr-2" /> Dashboard
            </Link>
            
            <Link to="/history" className={`px-4 py-2 rounded-md text-sm transition-all duration-200 flex items-center ${isActive('/history')}`}>
              <FaList className="mr-2" /> History
            </Link>

            <Link to="/goals" className={`px-4 py-2 rounded-md text-sm transition-all duration-200 flex items-center ${isActive('/goals')}`}>
              <FaBullseye className="mr-2 text-red-500" /> Goals
            </Link>
            
            {/* Add Button (Distinct Style) */}
            <Link to="/add" className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-200 flex items-center transform hover:scale-105">
              <FaPlus className="mr-2" /> Add New
            </Link>

            {/* 🚪 NEW: Logout Button (Desktop) */}
            <button 
              onClick={handleLogout} 
              className="ml-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 flex items-center border border-transparent hover:border-red-200"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in shadow-xl">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link to="/" onClick={closeMobileMenu} className={`px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive('/')}`}>
              <FaChartPie className="mr-3" /> Dashboard
            </Link>
            
            <Link to="/history" onClick={closeMobileMenu} className={`px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive('/history')}`}>
              <FaList className="mr-3" /> History
            </Link>

            <Link to="/goals" onClick={closeMobileMenu} className={`px-3 py-3 rounded-md text-base font-medium flex items-center ${isActive('/goals')}`}>
              <FaBullseye className="mr-3 text-red-500" /> Goals
            </Link>
            
            <Link to="/add" onClick={closeMobileMenu} className="mt-4 block w-full text-center px-4 py-3 rounded-md text-base font-bold bg-blue-600 text-white shadow-md">
              <FaPlus className="inline mr-2" /> Add Transaction
            </Link>

            {/* 🚪 NEW: Logout Button (Mobile) */}
            <button 
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }} 
              className="mt-2 block w-full text-center px-4 py-3 rounded-md text-base font-bold text-red-600 bg-red-50 border border-red-100 shadow-sm"
            >
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;