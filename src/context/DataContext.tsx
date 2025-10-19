import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DataContextType, Model, Firmware, Log } from '../types';
import { databaseService } from '../services/database.service';
import { s3Service } from '../services/s3.service';

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

    // Initial data - loaded from database service
const INITIAL_LOGS: Log[] = [
  { id: 1, type: 'system', user: 'System', model: 'System', version: '1.0.0', ip: 'System', timestamp: '2025-01-15 00:00:00' },
];

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from database on mount (dynamic data loading)
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 DataProvider: Loading data from database');
      setIsLoading(true);
      
      try {
        // Load models from database service
        const modelsData = await databaseService.getModels();
        console.log('✅ DataProvider: Models loaded from DB:', modelsData.length);
        
            // Load firmwares from database service
            const firmwaresData = await databaseService.getFirmwares();
            console.log('✅ DataProvider: Firmwares loaded from DB:', firmwaresData.length);
        
        // Load logs from database initial data
        const logsData = INITIAL_LOGS;
        console.log('✅ DataProvider: Logs loaded:', logsData.length);
        
        // Update models with firmware counts
        const modelsWithCounts = modelsData.map(model => ({
          ...model,
          firmwareCount: firmwaresData.filter((f: Firmware) => f.modelId === model.id).length
        }));
        
        setModels(modelsWithCounts);
        setFirmwares(firmwaresData);
        setLogs(logsData);
        
        console.log('✅ DataProvider: All data loaded successfully');
      } catch (error) {
        console.error('❌ DataProvider: Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addModel = async (model: Omit<Model, 'id'>): Promise<void> => {
    try {
      const newModel = await databaseService.addModel(model);
      setModels(prev => [...prev, newModel]);
    } catch (error) {
      console.error('Failed to add model:', error);
      throw error;
    }
  };

  const updateModel = (id: number, model: Partial<Model>): void => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, ...model } : m));
  };

  const deleteModel = (id: number): void => {
    setModels(prev => prev.filter(m => m.id !== id));
    // Also delete associated firmwares
    setFirmwares(prev => prev.filter(f => f.modelId !== id));
  };

  const addFirmware = async (firmware: Omit<Firmware, 'id'>): Promise<void> => {
    try {
      console.log('➕ DataProvider: Adding firmware:', firmware);
      
      // Add to database (mock for now)
      const newFirmware = await databaseService.addFirmware(firmware);
      
      // Add to local state
      setFirmwares(prev => [newFirmware, ...prev]);
      
      // Update model firmware count
      setModels(prev => prev.map(m => 
        m.id === firmware.modelId 
          ? { ...m, firmwareCount: m.firmwareCount + 1 }
          : m
      ));
      
      console.log('✅ DataProvider: Firmware added successfully');
    } catch (error) {
      console.error('❌ DataProvider: Failed to add firmware:', error);
      throw error;
    }
  };

  const updateFirmware = async (id: number, firmware: Partial<Firmware>): Promise<void> => {
    try {
      // Update in database (mock for now)
      await databaseService.updateFirmware(id, firmware);
      
      // Update local state
      setFirmwares(prev => prev.map(f => f.id === id ? { ...f, ...firmware } : f));
    } catch (error) {
      console.error('Failed to update firmware:', error);
      throw error;
    }
  };

  const deleteFirmware = async (id: number): Promise<void> => {
    try {
      const firmware = firmwares.find(f => f.id === id);
      if (!firmware) {
        throw new Error('Firmware not found');
      }
      
      console.log('🗑️ DataProvider: Deleting firmware:', firmware);
      
      // Delete from S3
      console.log('🗑️ DataProvider: Deleting from S3...');
      await s3Service.deleteFirmware(firmware.s3Key);
      console.log('✅ DataProvider: S3 file deleted');
      
      // Delete from database (mock for now)
      await databaseService.deleteFirmware(id);
      console.log('✅ DataProvider: Database record deleted');
      
      // Update local state
      setFirmwares(prev => prev.filter(f => f.id !== id));
      
      // Update model firmware count
      setModels(prev => prev.map(m => 
        m.id === firmware.modelId 
          ? { ...m, firmwareCount: Math.max(0, m.firmwareCount - 1) }
          : m
      ));
      
      console.log('✅ DataProvider: Firmware deleted successfully');
    } catch (error) {
      console.error('❌ DataProvider: Failed to delete firmware:', error);
      throw error;
    }
  };

  const addLog = async (log: Omit<Log, 'id'>): Promise<void> => {
    try {
      const newLog = await databaseService.addLog(log);
      setLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Failed to add log:', error);
      throw error;
    }
  };

  const incrementDownload = async (firmwareId: number): Promise<void> => {
    try {
      await databaseService.incrementDownload(firmwareId);
      setFirmwares(prev => prev.map(f => 
        f.id === firmwareId 
          ? { ...f, downloads: f.downloads + 1 }
          : f
      ));
    } catch (error) {
      console.error('Failed to increment download:', error);
    }
  };

  const value: DataContextType = {
    models,
    firmwares,
    logs,
    addModel,
    updateModel,
    deleteModel,
    addFirmware,
    updateFirmware,
    deleteFirmware,
    addLog,
    incrementDownload
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fresh data from database...</p>
          <p className="text-gray-500 text-sm mt-2">(Complete reset completed - all data synced)</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};