import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, HardDrive, FileText, TrendingUp, Download, Upload, AlertTriangle, RefreshCw } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useData } from '../../context/DataContext';
import { s3Service } from '../../services/s3.service';

export default function AdminDashboard() {
  const { models, firmwares, logs } = useData();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleCompleteReset = async () => {
    if (resetConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm the reset');
      return;
    }

    setIsResetting(true);
    console.log('🔄 AdminDashboard: Starting complete reset...');

    try {
      // Clear all S3 files
      console.log('🗑️ AdminDashboard: Clearing S3 bucket...');
      await s3Service.deleteAllFirmwares();
      console.log('✅ AdminDashboard: S3 cleared');

          // Clear browser storage
          console.log('🗑️ AdminDashboard: Clearing browser storage...');
          sessionStorage.clear();
          console.log('✅ AdminDashboard: Browser storage cleared');

      // Reload the page to trigger fresh data load
      console.log('🔄 AdminDashboard: Reloading page...');
      window.location.reload();
      
    } catch (error) {
      console.error('❌ AdminDashboard: Reset failed:', error);
      alert('Reset failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
      setResetConfirmText('');
    }
  };

  const stats = [
    { label: 'Total Models', value: models.length.toString(), change: '+2 this month' },
    { label: 'Total Firmware', value: firmwares.length.toString(), change: '+12 this month' },
    { label: 'Total Downloads', value: firmwares.reduce((sum, f) => sum + f.downloads, 0).toLocaleString(), change: '+324 this week' },
    { label: 'Storage Used', value: '2.4 GB', change: '64% capacity' },
  ];

  const recentActivity = logs.slice(0, 5).map(log => ({
    type: log.type,
    model: log.model,
    version: log.version,
    time: log.timestamp
  }));

  const topDownloads = models
    .map(model => ({
      model: model.name,
      downloads: firmwares
        .filter(f => f.modelId === model.id)
        .reduce((sum, f) => sum + f.downloads, 0)
    }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <header className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Overview of system activity and statistics</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={isResetting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Complete Reset
                </>
              )}
            </button>
          </div>
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
            <Link
              to="/admin/models"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <Package className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">Manage Models</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove crane models</p>
            </Link>
            <Link
              to="/admin/firmwares"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <HardDrive className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">Upload Firmware</h3>
              <p className="text-sm text-gray-600">Add new firmware versions to models</p>
            </Link>
            <Link
              to="/admin/logs"
              className="border border-gray-200 p-6 hover:border-black transition-colors group"
            >
              <FileText className="w-8 h-8 mb-4 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="text-lg font-bold mb-2">View Logs</h3>
              <p className="text-sm text-gray-600">Track all system activity and downloads</p>
            </Link>
          </div>
        </div>

        {/* Complete Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 max-w-md w-full mx-4 border border-gray-200">
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                <h2 className="text-xl font-bold text-red-600">Complete Reset</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  <strong>Warning:</strong> This will permanently delete ALL firmware files and logs.
                </p>
                <p className="text-gray-600 text-sm">
                  • All S3 firmware files will be deleted<br/>
                  • All database logs will be cleared<br/>
                  • Only model information will remain<br/>
                  • This action cannot be undone
                </p>
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <p className="text-red-800 text-sm font-medium">
                    Type <code className="bg-red-100 px-1 rounded">DELETE</code> to confirm:
                  </p>
                  <input
                    type="text"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 focus:outline-none focus:border-red-500"
                    placeholder="Type DELETE here"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmText('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium hover:border-gray-400 transition-colors"
                  disabled={isResetting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteReset}
                  disabled={isResetting || resetConfirmText !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Resetting...' : 'Reset Everything'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}