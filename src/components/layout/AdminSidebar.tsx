import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, HardDrive, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/models', icon: Package, label: 'Models' },
    { path: '/admin/firmwares', icon: HardDrive, label: 'Firmwares' },
    { path: '/admin/logs', icon: FileText, label: 'Logs' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black"></div>
          <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
        </Link>
        <div className="text-xs text-gray-500 mt-2">Admin Panel</div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-black text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-black transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
