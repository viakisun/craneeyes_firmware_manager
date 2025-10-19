import React, { useState } from 'react';
import { LayoutDashboard, Package, HardDrive, FileText, LogOut, Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminModels() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Stick Crane', subCategory: '' });

  const [models, setModels] = useState([
    { id: 1, name: 'SS1416', category: 'Stick Crane', subCategory: '5T', firmwareCount: 8 },
    { id: 2, name: 'SS1406', category: 'Stick Crane', subCategory: '5T', firmwareCount: 6 },
    { id: 3, name: 'SS1926', category: 'Stick Crane', subCategory: '5T', firmwareCount: 7 },
    { id: 4, name: 'SS2036Ace', category: 'Stick Crane', subCategory: '7T', firmwareCount: 12 },
    { id: 17, name: 'SSN2200A-PRO', category: 'Knuckle Crane', subCategory: '', firmwareCount: 9 },
    { id: 18, name: 'SSN2200III', category: 'Knuckle Crane', subCategory: '', firmwareCount: 8 },
  ]);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {});

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', category: 'Stick Crane', subCategory: '' });
    setShowModal(true);
  };

  const openEditModal = (model) => {
    setModalMode('edit');
    setFormData({ name: model.name, category: model.category, subCategory: model.subCategory });
    setSelectedModel(model);
    setShowModal(true);
  };

  const handleDelete = (modelId) => {
    if (confirm('Are you sure you want to delete this model?')) {
      setModels(models.filter(m => m.id !== modelId));
    }
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      const newModel = {
        id: Date.now(),
        ...formData,
        firmwareCount: 0
      };
      setModels([...models, newModel]);
    } else {
      setModels(models.map(m => m.id === selectedModel.id ? { ...m, ...formData } : m));
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
              className="flex items-center space-x-3 px-3 py-2 bg-black text-white text-sm font-medium"
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
                          onClick={() => handleDelete(model.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add New Model' : 'Edit Model'}
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                {modalMode === 'create' ? 'Create Model' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}