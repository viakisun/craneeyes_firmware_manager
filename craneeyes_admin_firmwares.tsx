import React, { useState } from 'react';
import { LayoutDashboard, Package, HardDrive, FileText, LogOut, Upload, Edit, Trash2, X, Download, Calendar, File } from 'lucide-react';

export default function AdminFirmwares() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('upload');
  const [selectedFirmware, setSelectedFirmware] = useState(null);
  const [filterModel, setFilterModel] = useState('all');
  const [formData, setFormData] = useState({ 
    modelId: '', 
    version: '', 
    file: null,
    description: ''
  });

  const models = [
    { id: 1, name: 'SS1416' },
    { id: 2, name: 'SS1406' },
    { id: 3, name: 'SS1926' },
    { id: 4, name: 'SS2036Ace' },
    { id: 17, name: 'SSN2200A-PRO' },
    { id: 18, name: 'SSN2200III' },
  ];

  const [firmwares, setFirmwares] = useState([
    { id: 101, modelId: 1, modelName: 'SS1416', version: '2.4.1', releaseDate: '2025-03-15', size: '4.2 MB', downloads: 1247, description: 'Bug fixes and performance improvements' },
    { id: 102, modelId: 1, modelName: 'SS1416', version: '2.4.0', releaseDate: '2025-02-28', size: '4.1 MB', downloads: 2891, description: 'Major update with new features' },
    { id: 103, modelId: 4, modelName: 'SS2036Ace', version: '3.1.2', releaseDate: '2025-03-10', size: '5.8 MB', downloads: 892, description: 'Security patches and stability fixes' },
    { id: 104, modelId: 17, modelName: 'SSN2200A-PRO', version: '1.9.0', releaseDate: '2025-03-20', size: '6.3 MB', downloads: 445, description: 'New control algorithms' },
    { id: 105, modelId: 18, modelName: 'SSN2200III', version: '2.1.5', releaseDate: '2025-03-01', size: '5.2 MB', downloads: 1203, description: 'Performance optimization' },
  ]);

  const filteredFirmwares = filterModel === 'all' 
    ? firmwares 
    : firmwares.filter(f => f.modelId === parseInt(filterModel));

  const openUploadModal = () => {
    setModalMode('upload');
    setFormData({ modelId: '', version: '', file: null, description: '' });
    setShowModal(true);
  };

  const openEditModal = (firmware) => {
    setModalMode('edit');
    setFormData({ 
      modelId: firmware.modelId, 
      version: firmware.version, 
      file: null,
      description: firmware.description 
    });
    setSelectedFirmware(firmware);
    setShowModal(true);
  };

  const handleDelete = (firmwareId) => {
    if (confirm('Are you sure you want to delete this firmware?')) {
      setFirmwares(firmwares.filter(f => f.id !== firmwareId));
    }
  };

  const handleSubmit = () => {
    if (modalMode === 'upload') {
      const model = models.find(m => m.id === parseInt(formData.modelId));
      const newFirmware = {
        id: Date.now(),
        modelId: parseInt(formData.modelId),
        modelName: model.name,
        version: formData.version,
        releaseDate: new Date().toISOString().split('T')[0],
        size: '0 MB',
        downloads: 0,
        description: formData.description
      };
      setFirmwares([newFirmware, ...firmwares]);
    } else {
      setFirmwares(firmwares.map(f => 
        f.id === selectedFirmware.id 
          ? { ...f, version: formData.version, description: formData.description }
          : f
      ));
    }
    setShowModal(false);
  };

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
              className="flex items-center space-x-3 px-3 py-2 bg-black text-white text-sm font-medium"
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Firmwares</h1>
              <p className="text-sm text-gray-600 mt-1">Upload and manage firmware versions</p>
            </div>
            <button
              onClick={openUploadModal}
              className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Firmware
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium">Filter by Model:</label>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="px-4 py-2 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
            >
              <option value="all">All Models</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="p-8">
          <div className="space-y-3">
            {filteredFirmwares.map((firmware) => (
              <div
                key={firmware.id}
                className="border border-gray-200 p-6 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-xl font-bold">{firmware.modelName}</div>
                      <div className="px-2 py-1 bg-black text-white text-xs font-medium">
                        v{firmware.version}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{firmware.releaseDate}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <File className="w-3 h-3" />
                        <span>{firmware.size}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-3 h-3" />
                        <span>{firmware.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{firmware.description}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openEditModal(firmware)}
                      className="p-2 border border-gray-300 hover:border-black transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(firmware.id)}
                      className="p-2 border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFirmwares.length === 0 && (
            <div className="border border-gray-200 p-16 text-center">
              <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-sm text-gray-600">No firmware found for this filter</div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {modalMode === 'upload' ? 'Upload Firmware' : 'Edit Firmware'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Crane Model</label>
                <select
                  value={formData.modelId}
                  onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select Model</option>
                  {models.map(model => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  placeholder="e.g., 2.4.1"
                />
              </div>

              {modalMode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Firmware File</label>
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
                  rows="3"
                  placeholder="Brief description of this firmware version"
                ></textarea>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-sm font-medium hover:border-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {modalMode === 'upload' ? 'Upload' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}