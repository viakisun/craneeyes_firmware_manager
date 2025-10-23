import { Model, Firmware, Log } from '../types';

class DatabaseService {
  private apiBaseUrl: string;

  constructor() {
    // 실제 백엔드 API 엔드포인트
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    this.apiBaseUrl = envUrl && envUrl.trim() !== '' ? envUrl : 'http://localhost:3001/api';
    console.log('🔧 DatabaseService: Initialized (using API endpoints)');
    console.log('🔧 DatabaseService: Env VITE_API_BASE_URL:', envUrl);
    console.log('🔧 DatabaseService: API Base URL:', this.apiBaseUrl);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    console.log('📡 DatabaseService: Making API request:', url);
    console.log('📡 DatabaseService: Options:', options);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ DatabaseService: API request successful');
      return data;
    } catch (error) {
      console.error('❌ DatabaseService: API request failed:', error);
      throw error;
    }
  }

  async getModels(): Promise<Model[]> {
    try {
      console.log('📊 DatabaseService: Fetching models from API');
      const models = await this.makeRequest<Model[]>('/models');
      console.log('✅ DatabaseService: Models fetched:', models.length);
      return models;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to fetch models:', error);
      // Fallback to hardcoded data if API is not available
      console.log('⚠️ DatabaseService: Using fallback data');
      return [
        { id: 1, name: 'SS1416', category: 'Stick Crane', subCategory: '5T', firmwareCount: 0 },
        { id: 2, name: 'SS1406', category: 'Stick Crane', subCategory: '5T', firmwareCount: 0 },
        { id: 3, name: 'SS1926', category: 'Stick Crane', subCategory: '5T', firmwareCount: 0 },
        { id: 4, name: 'SS2036Ace', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 5, name: 'SS2037Ace', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 6, name: 'ST2216', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 7, name: 'ST2217', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 8, name: 'SS2037D', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 9, name: 'ST2217D', category: 'Stick Crane', subCategory: '7T', firmwareCount: 0 },
        { id: 10, name: 'ST2507', category: 'Stick Crane', subCategory: '10T', firmwareCount: 0 },
        { id: 11, name: 'SS2725LB', category: 'Stick Crane', subCategory: '10T', firmwareCount: 0 },
        { id: 12, name: 'SS3506', category: 'Stick Crane', subCategory: '10T', firmwareCount: 0 },
        { id: 13, name: 'SS3506M', category: 'Stick Crane', subCategory: '10T', firmwareCount: 0 },
        { id: 14, name: 'SM7016', category: 'Stick Crane', subCategory: '20T', firmwareCount: 0 },
        { id: 15, name: 'SS75065', category: 'Stick Crane', subCategory: '20T', firmwareCount: 0 },
        { id: 16, name: 'ST7516', category: 'Stick Crane', subCategory: '20T', firmwareCount: 0 },
        { id: 17, name: 'SSN2200A-PRO', category: 'Knuckle Crane', subCategory: '', firmwareCount: 0 },
        { id: 18, name: 'SSN2200III', category: 'Knuckle Crane', subCategory: '', firmwareCount: 0 },
        { id: 19, name: 'SSN2800III', category: 'Knuckle Crane', subCategory: '', firmwareCount: 0 },
        { id: 20, name: 'SSN3000', category: 'Knuckle Crane', subCategory: '', firmwareCount: 0 },
      ];
    }
  }

  async getFirmwares(): Promise<Firmware[]> {
    try {
      console.log('📊 DatabaseService: Fetching firmwares from API');
      const firmwares = await this.makeRequest<Firmware[]>('/firmwares');
      console.log('✅ DatabaseService: Firmwares fetched:', firmwares.length);
      return firmwares;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to fetch firmwares:', error);
      // Fallback to empty array if API is not available
      console.log('⚠️ DatabaseService: Using fallback data (empty array)');
      return [];
    }
  }

  async getLogs(): Promise<Log[]> {
    try {
      console.log('📊 DatabaseService: Fetching logs from API');
      const logs = await this.makeRequest<Log[]>('/logs');
      console.log('✅ DatabaseService: Logs fetched:', logs.length);
      return logs;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to fetch logs:', error);
      // Fallback to empty array if API is not available
      console.log('⚠️ DatabaseService: Using fallback data (empty array)');
      return [];
    }
  }

  async addModel(model: Omit<Model, 'id'>): Promise<Model> {
    try {
      console.log('📝 DatabaseService: Adding model via API:', model);
      const newModel = await this.makeRequest<Model>('/models', {
        method: 'POST',
        body: JSON.stringify(model),
      });
      console.log('✅ DatabaseService: Model added:', newModel);
      return newModel;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to add model:', error);
      throw error;
    }
  }

  async addFirmware(firmware: Omit<Firmware, 'id'>): Promise<Firmware> {
    try {
      console.log('📝 DatabaseService: Adding firmware via API:', firmware);
      const newFirmware = await this.makeRequest<Firmware>('/firmwares', {
        method: 'POST',
        body: JSON.stringify(firmware),
      });
      console.log('✅ DatabaseService: Firmware added:', newFirmware);
      return newFirmware;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to add firmware:', error);
      throw error;
    }
  }

  async updateFirmware(id: number, firmware: Partial<Firmware>): Promise<void> {
    try {
      console.log('📝 DatabaseService: Updating firmware via API:', id, firmware);
      await this.makeRequest<void>(`/firmwares/${id}`, {
        method: 'PUT',
        body: JSON.stringify(firmware),
      });
      console.log('✅ DatabaseService: Firmware updated');
    } catch (error) {
      console.error('❌ DatabaseService: Failed to update firmware:', error);
      throw error;
    }
  }

  async deleteFirmware(id: number): Promise<void> {
    try {
      console.log('📝 DatabaseService: Deleting firmware via API:', id);
      await this.makeRequest<void>(`/firmwares/${id}`, {
        method: 'DELETE',
      });
      console.log('✅ DatabaseService: Firmware deleted');
    } catch (error) {
      console.error('❌ DatabaseService: Failed to delete firmware:', error);
      throw error;
    }
  }

  async addLog(log: Omit<Log, 'id'>): Promise<Log> {
    try {
      console.log('📝 DatabaseService: Adding log via API:', log);
      const newLog = await this.makeRequest<Log>('/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      });
      console.log('✅ DatabaseService: Log added:', newLog);
      return newLog;
    } catch (error) {
      console.error('❌ DatabaseService: Failed to add log:', error);
      throw error;
    }
  }

  async incrementDownload(firmwareId: number): Promise<void> {
    try {
      console.log('📝 DatabaseService: Incrementing download count via API:', firmwareId);
      await this.makeRequest<void>(`/firmwares/${firmwareId}/download`, {
        method: 'POST',
      });
      console.log('✅ DatabaseService: Download count incremented');
    } catch (error) {
      console.error('❌ DatabaseService: Failed to increment download:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();