import { useState } from 'react';
import { Upload, Edit, Trash2, Download, Calendar, File } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { s3Service } from '../../services/s3.service';
import { Firmware } from '../../types';

export default function AdminFirmwares() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'upload' | 'edit'>('upload');
  const [selectedFirmware, setSelectedFirmware] = useState<Firmware | null>(null);
  const [filterModel, setFilterModel] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    modelId: '',
    version: '',
    file: null as File | null,
    description: ''
  });

  const { models, firmwares, addFirmware, updateFirmware, deleteFirmware, addLog } = useData();

  const filteredFirmwares = filterModel === 'all' 
    ? firmwares 
    : firmwares.filter(f => f.modelId === parseInt(filterModel));

  const openUploadModal = () => {
    setModalMode('upload');
    setFormData({ modelId: '', version: '', file: null, description: '' });
    setShowModal(true);
  };

  const openEditModal = (firmware: Firmware) => {
    setModalMode('edit');
    setFormData({ 
      modelId: firmware.modelId.toString(), 
      version: firmware.version, 
      file: null,
      description: firmware.description 
    });
    setSelectedFirmware(firmware);
    setShowModal(true);
  };

  const handleDelete = async (firmwareId: number, firmwareName: string, version: string) => {
    if (!confirm(`Are you sure you want to delete ${firmwareName} v${version}?\n\nThis will permanently delete the firmware file from S3 and the database.`)) {
      return;
    }
    
    console.log('🗑️ AdminFirmwares: Starting delete process');
    
    try {
      // Delete firmware (will handle both S3 and DB)
      await deleteFirmware(firmwareId);
      
      // Log the deletion
      addLog({
        type: 'delete',
        user: 'crane@dy.co.kr',
        model: firmwareName,
        version: version,
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
      
      console.log('✅ AdminFirmwares: Delete completed successfully');
      alert('Firmware deleted successfully!');
    } catch (error) {
      console.error('❌ AdminFirmwares: Delete failed:', error);
      alert('Failed to delete firmware: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSubmit = async () => {
    console.log('🎯 AdminFirmwares: Starting form submission');
    console.log('📋 AdminFirmwares: Form data:', formData);
    console.log('🔧 AdminFirmwares: Modal mode:', modalMode);

    if (modalMode === 'upload') {
      if (!formData.file || !formData.modelId || !formData.version) {
        console.error('❌ AdminFirmwares: Missing required fields');
        alert('Please fill in all required fields');
        return;
      }

      console.log('✅ AdminFirmwares: All required fields present');
      setIsUploading(true);
      
      try {
        console.log('🔍 AdminFirmwares: Looking up model');
        const model = models.find(m => m.id === parseInt(formData.modelId));
        if (!model) {
          console.error('❌ AdminFirmwares: Model not found for ID:', formData.modelId);
          throw new Error('Model not found');
        }

        console.log('✅ AdminFirmwares: Model found:', model);

        // Upload to S3
        console.log('📤 AdminFirmwares: Starting S3 upload');
        const s3Key = await s3Service.uploadFirmware(
          formData.file, 
          model.name, 
          formData.version
        );

        console.log('✅ AdminFirmwares: S3 upload completed, key:', s3Key);

        // Add to local state
        console.log('💾 AdminFirmwares: Adding firmware to local state');
        addFirmware({
          modelId: parseInt(formData.modelId),
          modelName: model.name,
          version: formData.version,
          releaseDate: new Date().toISOString().split('T')[0],
          size: s3Service.formatFileSize(formData.file.size),
          downloads: 0,
          s3Key: s3Key,
          description: formData.description
        });

        console.log('✅ AdminFirmwares: Upload process completed successfully');

        // Log the upload
        console.log('📝 AdminFirmwares: Logging upload activity');
        addLog({
          type: 'upload',
          user: 'crane@dy.co.kr',
          model: model.name,
          version: formData.version,
          ip: 'Unknown',
          timestamp: new Date().toLocaleString()
        });

        console.log('✅ AdminFirmwares: Upload process completed successfully');
        setShowModal(false);
        setFormData({ modelId: '', version: '', file: null, description: '' });
      } catch (error) {
        console.error('❌ AdminFirmwares: Upload failed:', error);
        alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsUploading(false);
      }
    } else if (selectedFirmware) {
      updateFirmware(selectedFirmware.id, {
        version: formData.version,
        description: formData.description
      });
      
      addLog({
        type: 'edit',
        user: 'admin@craneeyes.com',
        model: selectedFirmware.modelName,
        version: formData.version,
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
      
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

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
                      onClick={() => handleDelete(firmware.id, firmware.modelName, firmware.version)}
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
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <div className="text-sm text-gray-600">No firmware found for this filter</div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'upload' ? 'Upload Firmware' : 'Edit Firmware'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Crane Model</label>
            <select
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              disabled={modalMode === 'edit' || isUploading}
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
              disabled={isUploading}
            />
          </div>

          {modalMode === 'upload' && (
            <div>
              <label className="block text-sm font-medium mb-2">Firmware File (.bin, .pdf, .zip, .txt)</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
                accept=".bin,.hex,.fw,.pdf,.zip,.txt"
                disabled={isUploading}
              />
            </div>
          )}

          {modalMode === 'edit' && selectedFirmware && (
            <div>
              <label className="block text-sm font-medium mb-2">S3 File Information</label>
              <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">S3 Key:</div>
                  <div className="text-sm font-mono break-all">{selectedFirmware.s3Key}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">File Name:</div>
                  <div className="text-sm font-medium">{selectedFirmware.s3Key.split('/').pop()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">File Size:</div>
                  <div className="text-sm">{selectedFirmware.size}</div>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const url = await s3Service.getDownloadUrl(selectedFirmware.s3Key);
                      
                      // Create download link instead of opening in new tab
                      const link = document.createElement('a');
                      link.href = url;
                      
                      // Extract original filename from S3 key
                      const originalFilename = selectedFirmware.s3Key.split('/').pop() || `firmware-${selectedFirmware.version}.txt`;
                      link.download = originalFilename;
                      
                      // Force download attributes
                      link.setAttribute('download', originalFilename);
                      link.setAttribute('target', '_self');
                      link.style.display = 'none';
                      
                      document.body.appendChild(link);
                      link.click();
                      
                      // Clean up after a short delay
                      setTimeout(() => {
                        document.body.removeChild(link);
                      }, 100);
                      
                    } catch (error) {
                      alert('Failed to generate download link');
                    }
                  }}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-sm hover:border-black transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download from S3</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              rows={3}
              placeholder="Brief description of this firmware version"
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex items-center justify-end space-x-3">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 border border-gray-300 text-sm font-medium hover:border-black transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : (modalMode === 'upload' ? 'Upload' : 'Save Changes')}
          </button>
        </div>
      </Modal>
    </div>
  );
}