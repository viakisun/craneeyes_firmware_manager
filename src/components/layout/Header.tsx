import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black"></div>
          <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
        </Link>
        <nav className="flex items-center space-x-8">
          <Link 
            to="/models" 
            className={`text-sm transition-colors ${
              currentPage === 'models' 
                ? 'text-black font-medium' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Firmware
          </Link>
          <Link 
            to="/admin/login" 
            className={`text-sm transition-colors ${
              currentPage === 'admin' 
                ? 'text-black font-medium' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};
