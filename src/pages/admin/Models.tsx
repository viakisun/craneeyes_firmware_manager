import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { Model } from '../../types';

export default function AdminModels() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Stick Crane' as 'Stick Crane' | 'Knuckle Crane', subCategory: '', firmwareCount: 0 });
  
  const { models, addModel, updateModel, deleteModel, addLog } = useData();

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', category: 'Stick Crane', subCategory: '', firmwareCount: 0 });
    setShowModal(true);
  };

  const openEditModal = (model: Model) => {
    setModalMode('edit');
    setFormData({ name: model.name, category: model.category, subCategory: model.subCategory, firmwareCount: model.firmwareCount });
    setSelectedModel(model);
    setShowModal(true);
  };

  const handleDelete = (modelId: number, modelName: string) => {
    if (confirm('Are you sure you want to delete this model? This will also delete all associated firmware.')) {
      deleteModel(modelId);
      addLog({
        type: 'delete',
        user: 'admin@craneeyes.com',
        model: modelName,
        version: 'N/A',
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
    }
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      addModel({ ...formData, firmwareCount: 0 });
      addLog({
        type: 'upload',
        user: 'admin@craneeyes.com',
        model: formData.name,
        version: 'N/A',
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
    } else if (selectedModel) {
      updateModel(selectedModel.id, formData);
      addLog({
        type: 'edit',
        user: 'admin@craneeyes.com',
        model: formData.name,
        version: 'N/A',
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <header className="border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crane Models</h1>
            <p className="text-sm text-gray-600 mt-1">Manage all crane models and specifications</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </button>
        </header>

        <div className="p-8">
          {Object.entries(groupedModels).map(([category, categoryModels]) => (
            <div key={category} className="mb-12">
              <div className="border-b border-black pb-3 mb-6">
                <h2 className="text-xl font-bold">{category}</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {categoryModels.map((model) => (
                  <div
                    key={model.id}
                    className="border border-gray-200 p-6 hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div>
                          <div className="text-lg font-bold mb-1">{model.name}</div>
                          <div className="text-sm text-gray-600">
                            {model.subCategory && `${model.subCategory} • `}
                            {model.firmwareCount} firmware versions
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(model)}
                          className="p-2 border border-gray-300 hover:border-black transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id, model.name)}
                          className="p-2 border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Add New Model' : 'Edit Model'}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Model Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              placeholder="e.g., SS1416"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Stick Crane' | 'Knuckle Crane' })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
            >
              <option value="Stick Crane">Stick Crane</option>
              <option value="Knuckle Crane">Knuckle Crane</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sub Category (Optional)</label>
            <input
              type="text"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors"
              placeholder="e.g., 5T, 7T, 10T"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex items-center justify-end space-x-3">
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
            {modalMode === 'create' ? 'Create Model' : 'Save Changes'}
          </button>
        </div>
      </Modal>
    </div>
  );
}