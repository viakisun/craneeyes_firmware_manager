import React, { useState } from 'react';
import { Download, ChevronRight, Calendar, FileText } from 'lucide-react';

export default function PublicModels() {
  const [selectedModel, setSelectedModel] = useState(null);

  const models = [
    { id: 1, name: 'SS1416', category: 'Stick Crane', subCategory: '5T', firmwareCount: 8 },
    { id: 2, name: 'SS1406', category: 'Stick Crane', subCategory: '5T', firmwareCount: 6 },
    { id: 3, name: 'SS1926', category: 'Stick Crane', subCategory: '5T', firmwareCount: 7 },
    { id: 4, name: 'SS2036Ace', category: 'Stick Crane', subCategory: '7T', firmwareCount: 12 },
    { id: 5, name: 'SS2037Ace', category: 'Stick Crane', subCategory: '7T', firmwareCount: 10 },
    { id: 6, name: 'ST2216', category: 'Stick Crane', subCategory: '7T', firmwareCount: 9 },
    { id: 7, name: 'ST2217', category: 'Stick Crane', subCategory: '7T', firmwareCount: 8 },
    { id: 8, name: 'SS2037D', category: 'Stick Crane', subCategory: '7T', firmwareCount: 11 },
    { id: 9, name: 'ST2217D', category: 'Stick Crane', subCategory: '7T', firmwareCount: 7 },
    { id: 10, name: 'ST2507', category: 'Stick Crane', subCategory: '10T', firmwareCount: 15 },
    { id: 11, name: 'SS2725LB', category: 'Stick Crane', subCategory: '10T', firmwareCount: 13 },
    { id: 12, name: 'SS3506', category: 'Stick Crane', subCategory: '10T', firmwareCount: 14 },
    { id: 13, name: 'SS3506M', category: 'Stick Crane', subCategory: '10T', firmwareCount: 12 },
    { id: 14, name: 'SM7016', category: 'Stick Crane', subCategory: '20T', firmwareCount: 18 },
    { id: 15, name: 'SS75065', category: 'Stick Crane', subCategory: '20T', firmwareCount: 16 },
    { id: 16, name: 'ST7516', category: 'Stick Crane', subCategory: '20T', firmwareCount: 14 },
    { id: 17, name: 'SSN2200A-PRO', category: 'Knuckle Crane', subCategory: '', firmwareCount: 9 },
    { id: 18, name: 'SSN2200III', category: 'Knuckle Crane', subCategory: '', firmwareCount: 8 },
    { id: 19, name: 'SSN2800III', category: 'Knuckle Crane', subCategory: '', firmwareCount: 10 },
    { id: 20, name: 'SSN3000', category: 'Knuckle Crane', subCategory: '', firmwareCount: 11 },
  ];

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {});

  const firmwares = {
    1: [
      { id: 101, version: '2.4.1', releaseDate: '2025-03-15', size: '4.2 MB', downloads: 1247 },
      { id: 102, version: '2.4.0', releaseDate: '2025-02-28', size: '4.1 MB', downloads: 2891 },
      { id: 103, version: '2.3.5', releaseDate: '2025-01-20', size: '4.0 MB', downloads: 3456 },
    ],
    2: [
      { id: 201, version: '3.1.2', releaseDate: '2025-03-10', size: '5.8 MB', downloads: 892 },
      { id: 202, version: '3.1.1', releaseDate: '2025-02-15', size: '5.7 MB', downloads: 1654 },
    ],
    3: [
      { id: 301, version: '1.9.0', releaseDate: '2025-03-20', size: '6.3 MB', downloads: 445 },
      { id: 302, version: '1.8.9', releaseDate: '2025-03-01', size: '6.2 MB', downloads: 1203 },
    ],
  };

  const handleDownload = (firmwareId, version) => {
    console.log(`Downloading firmware: ${version}`);
    alert(`Downloading firmware version ${version}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black"></div>
            <span className="text-xl font-semibold tracking-tight">CRANEEYES</span>
          </div>
          <nav className="flex items-center space-x-8">
            <a href="/" className="text-sm text-gray-600 hover:text-black transition-colors">
              Home
            </a>
            <a href="/models" className="text-sm text-black font-medium">
              Firmware
            </a>
            <a href="/admin/login" className="text-sm text-gray-600 hover:text-black transition-colors">
              Admin
            </a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Firmware Downloads</h1>
          <p className="text-gray-600">Select your crane model to view available firmware versions</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <div className="sticky top-6">
              <div className="text-xs font-semibold text-gray-500 mb-4 tracking-wide">CRANE MODELS</div>
              <div className="space-y-8">
                {Object.entries(groupedModels).map(([category, categoryModels]) => (
                  <div key={category}>
                    <div className="border-b border-black pb-2 mb-3">
                      <div className="text-sm font-bold tracking-wide">{category}</div>
                    </div>
                    <div className="space-y-1">
                      {categoryModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          className={`w-full text-left px-4 py-3 border transition-colors ${
                            selectedModel === model.id
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-sm">{model.name}</div>
                              {model.subCategory && (
                                <div className={`text-xs mt-1 ${
                                  selectedModel === model.id ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {model.subCategory}
                                </div>
                              )}
                            </div>
                            <div className={`text-xs ${
                              selectedModel === model.id ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {model.firmwareCount}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-8">
            {selectedModel ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {models.find(m => m.id === selectedModel)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Available firmware versions for this model
                  </p>
                </div>

                <div className="space-y-3">
                  {(firmwares[selectedModel] || []).map((firmware) => (
                    <div
                      key={firmware.id}
                      className="border border-gray-200 p-6 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-xl font-bold mb-2">Version {firmware.version}</div>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{firmware.releaseDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3" />
                              <span>{firmware.size}</span>
                            </div>
                            <div>
                              <span>{firmware.downloads.toLocaleString()} downloads</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(firmware.id, firmware.version)}
                          className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        Firmware update package for {models.find(m => m.id === selectedModel)?.name}. 
                        Includes system improvements and bug fixes.
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 p-16 text-center">
                <div className="text-gray-400 mb-2">
                  <ChevronRight className="w-12 h-12 mx-auto" />
                </div>
                <div className="text-sm text-gray-600">
                  Select a crane model to view available firmware
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2025 CraneEyes. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Documentation
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Support
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}