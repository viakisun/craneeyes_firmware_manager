import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Power, Key, Shield, Download } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Modal } from '../../components/ui/Modal';
import { sftpUsersService } from '../../services/sftp-users.service';
import { SftpUser } from '../../types';

export default function AdminSftpUsers() {
  const [users, setUsers] = useState<SftpUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<SftpUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'downloader' as 'admin' | 'downloader'
  });

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
    setFormData({ username: '', password: '', role: 'downloader' });
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: SftpUser) => {
    setModalMode('edit');
    setFormData({ 
      username: user.username, 
      password: '', 
      role: user.role 
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
        await sftpUsersService.create(formData.username, formData.password, formData.role);
        alert('SFTP user created successfully!');
      } else if (selectedUser) {
        const updateData: { password?: string; role?: 'admin' | 'downloader' } = {};
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        if (formData.role !== selectedUser.role) {
          updateData.role = formData.role;
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
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user:', error);
      alert('Failed to toggle user status');
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await sftpUsersService.delete(userId);
      alert('SFTP user deleted successfully!');
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">FTP 계정 관리</h1>
              <p className="text-gray-600">SFTP 사용자 계정을 관리합니다</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-gray-800"
            >
              <UserPlus size={18} />
              <span>새 계정 추가</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-sm">
            <div className="flex items-start space-x-2">
              <Shield size={16} className="mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900 mb-1">SFTP 접속 정보</p>
                <p className="text-blue-800">
                  호스트: <code className="bg-blue-100 px-1 py-0.5">your-server-ip</code> | 
                  포트: <code className="bg-blue-100 px-1 py-0.5">2222</code>
                </p>
                <p className="text-blue-700 mt-2">
                  접속 명령: <code className="bg-blue-100 px-2 py-0.5">sftp -P 2222 username@your-server-ip</code>
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">사용자명</th>
                  <th className="text-left p-4 font-medium text-sm">역할</th>
                  <th className="text-left p-4 font-medium text-sm">상태</th>
                  <th className="text-left p-4 font-medium text-sm">생성일</th>
                  <th className="text-left p-4 font-medium text-sm">수정일</th>
                  <th className="text-right p-4 font-medium text-sm">작업</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      등록된 FTP 계정이 없습니다
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {user.role === 'admin' ? (
                            <>
                              <Shield size={16} className="text-red-500" />
                              <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium">
                                관리자
                              </span>
                            </>
                          ) : (
                            <>
                              <Download size={16} className="text-blue-500" />
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium">
                                다운로더
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium ${
                            user.enabled
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {user.enabled ? '활성화' : '비활성화'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(user.updatedAt)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-gray-100"
                            title="편집"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleToggle(user.id, user.username, user.enabled)}
                            className={`p-2 hover:bg-gray-100 ${
                              user.enabled ? 'text-orange-600' : 'text-green-600'
                            }`}
                            title={user.enabled ? '비활성화' : '활성화'}
                          >
                            <Power size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-2 text-red-600 hover:bg-red-50"
                            title="삭제"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Role Descriptions */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 text-sm">
            <h3 className="font-medium mb-2">역할 설명</h3>
            <div className="space-y-1 text-gray-700">
              <p><strong>관리자 (admin):</strong> 파일 업로드, 다운로드, 삭제 가능</p>
              <p><strong>다운로더 (downloader):</strong> 파일 다운로드만 가능 (읽기 전용)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? '새 FTP 계정 추가' : 'FTP 계정 수정'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              사용자명 {modalMode === 'create' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={modalMode === 'edit'}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black disabled:bg-gray-100"
              placeholder="sftpuser"
            />
            {modalMode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">사용자명은 수정할 수 없습니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              비밀번호 {modalMode === 'create' && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Key size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                placeholder={modalMode === 'edit' ? '변경하려면 입력하세요' : '비밀번호'}
              />
            </div>
            {modalMode === 'edit' && (
              <p className="text-xs text-gray-500 mt-1">비워두면 비밀번호가 변경되지 않습니다</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              역할 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'downloader' })}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
            >
              <option value="downloader">다운로더 (읽기 전용)</option>
              <option value="admin">관리자 (읽기/쓰기)</option>
            </select>
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {isLoading ? '저장 중...' : modalMode === 'create' ? '생성' : '수정'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

