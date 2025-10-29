import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import Home from './pages/public/Home';
import Models from './pages/public/Models';

// Auth pages
import Login from './pages/auth/Login';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import AdminModels from './pages/admin/Models';
import AdminFirmwares from './pages/admin/Firmwares';
import AdminLogs from './pages/admin/Logs';
import AdminSftpUsers from './pages/admin/SftpUsers';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Models />} />
            
            {/* Auth routes */}
            <Route path="/admin/login" element={<Login />} />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/models" element={
              <ProtectedRoute>
                <AdminModels />
              </ProtectedRoute>
            } />
            <Route path="/admin/firmwares" element={
              <ProtectedRoute>
                <AdminFirmwares />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute>
                <AdminLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/sftp-users" element={
              <ProtectedRoute>
                <AdminSftpUsers />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
