import React from 'react';
import { LayoutDashboard, Package, HardDrive, FileText, TrendingUp, Download, Upload, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Models', value: '20', change: '+2 this month' },
    { label: 'Total Firmware', value: '156', change: '+12 this month' },
    { label: 'Total Downloads', value: '8,432', change: '+324 this week' },
    { label: 'Storage Used', value: '2.4 GB', change: '64% capacity' },
  ];

  const recentActivity = [
    { type: 'upload', model: 'SS2037Ace', version: '3.1.2', time: '2 hours ago' },
    { type: 'download', model: 'SSN3000', version: '2.4.1', time: '3 hours ago' },
    { type: 'upload', model: 'ST7516', version: '1.9.0', time: '5 hours ago' },
    { type: 'download', model: 'SS3506M', version: '2.1.5', time: '6 hours ago' },
    { type: 'download', model: 'SSN2200A-PRO', version: '4.0.2', time: '8 hours ago' },
  ];

  const topDownloads = [
    { model: 'SS2037Ace', downloads: 1247 },
    { model: 'SSN3000', downloads: 1103 },
    { model: 'ST7516', downloads: 892 },
    { model: 'SS3506M', downloads: 756 },
    { model: 'SSN2200III', downloads: 634 },
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
              className="flex items-center space-x-3 px-3 py-2 bg-black text-white text-sm font-medium"
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
              className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Overview of system activity and statistics</p>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="border border-gray-200 p-6">
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-start space-x-3">
                      {activity.type === 'upload' ? (
                        <div className="w-8 h-8 bg-black flex items-center justify-center mt-0.5">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mt-0.5">
                          <Download className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium">{activity.model}</div>
                        <div className="text-xs text-gray-500">Version {activity.version}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Top Downloads</h2>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {topDownloads.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                      <div className="text-sm font-medium">{item.model}</div>
                    </div>
                    <div className="text-sm text-gray-600">{item.downloads.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <a
              href="/admin/models"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <Package className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">Manage Models</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove crane models</p>
            </a>
            <a
              href="/admin/firmwares"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <HardDrive className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">Upload Firmware</h3>
              <p className="text-sm text-gray-600">Add new firmware versions to models</p>
            </a>
            <a
              href="/admin/logs"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <FileText className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">View Logs</h3>
              <p className="text-sm text-gray-600">Track all system activity and downloads</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}