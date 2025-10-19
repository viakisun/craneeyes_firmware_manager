import { useState } from 'react';
import { Download, Upload, Edit, Trash2, Filter, FileText } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useData } from '../../context/DataContext';

export default function AdminLogs() {
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  
  const { logs } = useData();

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return log.timestamp.includes(today);
    }
    if (filterDate === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      return log.timestamp.includes(yesterdayStr);
    }
    return true;
  });

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'download': return <Download className="w-4 h-4" />;
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLogColor = (type: string) => {
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
    { label: 'Downloads Today', value: logs.filter(l => l.type === 'download' && l.timestamp.includes(new Date().toISOString().split('T')[0])).length },
    { label: 'Uploads Today', value: logs.filter(l => l.type === 'upload' && l.timestamp.includes(new Date().toISOString().split('T')[0])).length },
    { label: 'Admin Actions', value: logs.filter(l => l.user !== 'Anonymous').length },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

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