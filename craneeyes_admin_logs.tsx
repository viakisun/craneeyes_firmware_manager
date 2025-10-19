import React, { useState } from 'react';
import { LayoutDashboard, Package, HardDrive, FileText, LogOut, Download, Upload, Edit, Trash2, Filter } from 'lucide-react';

export default function AdminLogs() {
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  const logs = [
    { id: 1, type: 'download', user: 'Anonymous', model: 'SS2036Ace', version: '3.1.2', ip: '192.168.1.45', timestamp: '2025-03-20 14:32:15' },
    { id: 2, type: 'upload', user: 'admin@craneeyes.com', model: 'SSN3000', version: '1.9.0', ip: '10.0.0.12', timestamp: '2025-03-20 13:15:22' },
    { id: 3, type: 'download', user: 'Anonymous', model: 'SS1416', version: '2.4.1', ip: '203.123.45.67', timestamp: '2025-03-20 12:48:03' },
    { id: 4, type: 'edit', user: 'admin@craneeyes.com', model: 'ST7516', version: '1.9.0', ip: '10.0.0.12', timestamp: '2025-03-20 11:22:41' },
    { id: 5, type: 'download', user: 'Anonymous', model: 'SSN2200III', version: '2.1.5', ip: '172.16.0.88', timestamp: '2025-03-20 10:15:33' },
    { id: 6, type: 'upload', user: 'admin@craneeyes.com', model: 'SS3506M', version: '2.2.0', ip: '10.0.0.12', timestamp: '2025-03-20 09:45:12' },
    { id: 7, type: 'delete', user: 'admin@craneeyes.com', model: 'SS2037D', version: '1.5.3', ip: '10.0.0.12', timestamp: '2025-03-20 09:12:45' },
    { id: 8, type: 'download', user: 'Anonymous', model: 'SS1926', version: '2.0.8', ip: '59.28.134.22', timestamp: '2025-03-20 08:33:27' },
    { id: 9, type: 'download', user: 'Anonymous', model: 'SSN2200A-PRO', version: '4.0.2', ip: '121.165.23.90', timestamp: '2025-03-19 23:17:56' },
    { id: 10, type: 'edit', user: 'admin@craneeyes.com', model: 'SS1406', version: '1.8.2', ip: '10.0.0.12', timestamp: '2025-03-19 18:42:18' },
    { id: 11, type: 'download', user: 'Anonymous', model: 'ST2217', version: '3.0.1', ip: '211.47.82.154', timestamp: '2025-03-19 16:28:09' },
    { id: 12, type: 'upload', user: 'admin@craneeyes.com', model: 'SM7016', version: '2.5.0', ip: '10.0.0.12', timestamp: '2025-03-19 15:03:44' },
  ];

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (filterDate === 'today') {
      return log.timestamp.startsWith('2025-03-20');
    }
    if (filterDate === 'yesterday') {
      return log.timestamp.startsWith('2025-03-19');
    }
    return true;
  });

  const getLogIcon = (type) => {
    switch(type) {
      case 'download': return <Download className="w-4 h-4" />;
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLogColor = (type) => {
    switch(type) {
      case 'download': return 'border-gray-300 text-gray-600';
      case 'upload': return 'border-black bg-black text-white';
      case 'edit': return 'border-blue-500 text-blue-500';
      case 'delete': return 'border-red-500 text-red-500';
      default: return 'border-gray-300 text-gray-600';
    }
  };

  const stats = [
    { label: 'Total Logs', value: logs.length },
    { label: 'Downloads Today', value: logs.filter(l => l.type === 'download' && l.timestamp.startsWith('2025-03-20')).length },
    { label: 'Uploads Today', value: logs.filter(l => l.type === 'upload' && l.timestamp.startsWith('2025-03-20')).length },
    { label: 'Admin Actions', value: logs.filter(l => l.user !== 'Anonymous').length },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black"></div>
            <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">Admin Panel</div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <a
              href="/admin"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="/admin/models"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Models</span>
            </a>
            <a
              href="/admin/firmwares"
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <HardDrive className="w-4 h-4" />
              <span>Firmwares</span>
            </a>
            <a
              href="/admin/logs"
              className="flex items-center space-x-3 px-3 py-2 bg-black text-white text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              <span>Logs</span>
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-black transition-colors w-full">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="border-b border-gray-200 px-8 py-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-sm text-gray-600 mt-1">Track all system activity and user actions</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <label className="text-sm font-medium">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
              >
                <option value="all">All Types</option>
                <option value="download">Download</option>
                <option value="upload">Upload</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Date:</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="border border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600">
              <div className="col-span-1">TYPE</div>
              <div className="col-span-2">USER</div>
              <div className="col-span-2">MODEL</div>
              <div className="col-span-1">VERSION</div>
              <div className="col-span-2">IP ADDRESS</div>
              <div className="col-span-4">TIMESTAMP</div>
            </div>

            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0"
              >
                <div className="col-span-1 flex items-center">
                  <div className={`w-8 h-8 border flex items-center justify-center ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                  </div>
                </div>
                <div className="col-span-2 flex items-center text-sm">{log.user}</div>
                <div className="col-span-2 flex items-center text-sm font-medium">{log.model}</div>
                <div className="col-span-1 flex items-center text-sm text-gray-600">{log.version}</div>
                <div className="col-span-2 flex items-center text-sm text-gray-600 font-mono">{log.ip}</div>
                <div className="col-span-4 flex items-center text-sm text-gray-600">{log.timestamp}</div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="border border-gray-200 p-16 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-sm text-gray-600">No logs found for this filter</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}