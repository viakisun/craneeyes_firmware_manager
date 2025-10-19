import { useState } from 'react';
import { Download, ChevronRight, Calendar, FileText } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { useData } from '../../context/DataContext';
import { s3Service } from '../../services/s3.service';

export default function PublicModels() {
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const { models, firmwares, addLog, incrementDownload } = useData();

  console.log('🎯 PublicModels: Component rendered');
  console.log('📊 PublicModels: Models data:', models);
  console.log('📊 PublicModels: Firmwares data:', firmwares);
  console.log('📊 PublicModels: Models count:', models.length);
  console.log('📊 PublicModels: Firmwares count:', firmwares.length);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  console.log('📂 PublicModels: Grouped models:', groupedModels);
  console.log('📂 PublicModels: Categories:', Object.keys(groupedModels));

  const selectedModelFirmwares = selectedModel 
    ? firmwares.filter(f => f.modelId === selectedModel)
    : [];

  const handleDownload = async (firmwareId: number, version: string, s3Key: string) => {
    console.log('🔗 PublicModels: Starting download process');
    console.log('📋 PublicModels: Download params:', { firmwareId, version, s3Key });

    try {
      // Generate presigned URL
      console.log('🔗 PublicModels: Generating presigned URL');
      const downloadUrl = await s3Service.getDownloadUrl(s3Key);
      console.log('✅ PublicModels: Download URL generated');
      
      // Create temporary link and trigger download
      console.log('📥 PublicModels: Creating download link');
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract original filename from S3 key
      const originalFilename = s3Key.split('/').pop() || `firmware-${version}.bin`;
      
      link.download = originalFilename;
      
      // Force download attributes to prevent opening in new tab
      link.setAttribute('download', originalFilename);
      link.setAttribute('target', '_self');
      link.style.display = 'none';
      
      console.log('📁 PublicModels: Download filename (original):', link.download);
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      console.log('✅ PublicModels: Download triggered');

      // Log the download
      console.log('📝 PublicModels: Logging download activity');
      addLog({
        type: 'download',
        user: 'Anonymous',
        model: models.find(m => m.id === selectedModel)?.name || '',
        version: version,
        ip: 'Unknown',
        timestamp: new Date().toLocaleString()
      });

      // Increment download count
      console.log('📊 PublicModels: Incrementing download count');
      incrementDownload(firmwareId);
      console.log('✅ PublicModels: Download process completed');
    } catch (error) {
      console.error('❌ PublicModels: Download failed:', error);
      if (error instanceof Error) {
        console.error('❌ PublicModels: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="models" />

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
                  {selectedModelFirmwares.map((firmware) => (
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
                          onClick={() => handleDownload(firmware.id, firmware.version, firmware.s3Key)}
                          className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 leading-relaxed">
                        {firmware.description}
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

      <Footer />
    </div>
  );
}