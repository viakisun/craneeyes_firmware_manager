import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            © 2025 CraneEyes. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
              Support
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
