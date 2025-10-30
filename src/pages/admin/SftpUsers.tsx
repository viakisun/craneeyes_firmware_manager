import { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Modal } from '../../components/ui/Modal';
import { sftpUsersService } from '../../services/sftp-users.service';
import { SftpUser } from '../../types';
import { useData } from '../../context/DataContext';

export default function AdminSftpUsers() {
  const [users, setUsers] = useState<SftpUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<SftpUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'downloader' as 'admin' | 'downloader',
    allowedModels: [] as string[]
  });

  const { models } = useData();

  // Load SFTP users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await sftpUsersService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load SFTP users:', error);
      alert('Failed to load SFTP users');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ username: '', password: '', role: 'downloader', allowedModels: [] });
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: SftpUser) => {
    setModalMode('edit');
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role,
      allowedModels: user.allowedModels || []
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (modalMode === 'create' && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    setIsLoading(true);

    try {
      if (modalMode === 'create') {
        await sftpUsersService.create(
          formData.username, 
          formData.password, 
          formData.role,
          formData.allowedModels
        );
        alert('SFTP user created successfully!');
      } else if (selectedUser) {
        const updateData: { 
          password?: string; 
          role?: 'admin' | 'downloader'; 
          allowedModels?: string[];
        } = {};
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        if (formData.role !== selectedUser.role) {
          updateData.role = formData.role;
        }

        if (JSON.stringify(formData.allowedModels) !== JSON.stringify(selectedUser.allowedModels)) {
          updateData.allowedModels = formData.allowedModels;
        }

        if (Object.keys(updateData).length > 0) {
          await sftpUsersService.update(selectedUser.id, updateData);
          alert('SFTP user updated successfully!');
        } else {
          alert('No changes to update');
        }
      }

      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Failed to save SFTP user:', error);
      alert('Failed to save SFTP user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (userId: number, username: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} user "${username}"?`)) {
      return;
    }

    try {
      await sftpUsersService.toggle(userId);
      alert(`User ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user:', error);
      alert('Failed to toggle user status');
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await sftpUsersService.delete(userId);
      alert('User deleted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setFormData({ ...formData, allowedModels: selected });
  };

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-black">SFTP Users</h1>
                <p className="text-gray-600 mt-1">Manage SFTP user accounts and model access</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open('/docs/SFTP_USER_GUIDE.html', '_blank')}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  title="View complete SFTP connection guide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  User Guide
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors border border-black"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Connection Info */}
          <div className="mb-8 p-4 border border-gray-300 bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-black">SFTP Connection Info</h2>
              <a
                href="/docs/SFTP_USER_GUIDE.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View complete guide
              </a>
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Host:</span> sftp.craneeyes.com or 54.180.29.96</p>
              <p><span className="font-medium">Port:</span> 2222</p>
              <p><span className="font-medium">Connection:</span> sftp -P 2222 [username]@sftp.craneeyes.com</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Allowed Models</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-black">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs border ${
                        user.role === 'admin' 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs border ${
                        user.enabled 
                          ? 'bg-white text-green-700 border-green-700' 
                          : 'bg-white text-red-700 border-red-700'
                      }`}>
                        {user.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.allowedModels && user.allowedModels.length > 0 
                        ? `${user.allowedModels.length} models` 
                        : 'All models'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 text-sm border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(user.id, user.username, user.enabled)}
                          className="px-3 py-1 text-sm border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          {user.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="px-3 py-1 text-sm border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No SFTP users found. Click "Add User" to create one.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isLoading && setShowModal(false)}
        title={modalMode === 'create' ? 'Create SFTP User' : 'Edit SFTP User'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={modalMode === 'edit'}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black disabled:bg-gray-100"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Password {modalMode === 'edit' && '(leave empty to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
              placeholder={modalMode === 'edit' ? 'Enter new password' : 'Enter password'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'downloader' })}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
            >
              <option value="downloader">Downloader (Read-only)</option>
              <option value="admin">Admin (Read/Write)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Allowed Models (hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={formData.allowedModels}
              onChange={handleModelSelect}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black min-h-[200px]"
            >
              {models.map((model) => (
                <option key={model.id} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {formData.allowedModels.length === 0 
                ? 'No models selected = Access to all models' 
                : `${formData.allowedModels.length} model(s) selected: ${formData.allowedModels.join(', ')}`}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (modalMode === 'create' ? 'Create User' : 'Update User')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
