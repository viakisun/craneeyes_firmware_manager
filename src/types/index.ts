export interface Model {
  id: number;
  name: string; // e.g., "SS1416", "SSN3000"
  category: 'Stick Crane' | 'Knuckle Crane';
  subCategory: string; // e.g., "5T", "7T", "" for knuckle
  firmwareCount: number;
}

export interface Firmware {
  id: number;
  modelId: number;
  modelName: string;
  version: string;
  releaseDate: string; // YYYY-MM-DD
  size: string;
  downloads: number;
  s3Key: string; // S3 object key
  description: string;
}

export interface Log {
  id: number;
  type: 'download' | 'upload' | 'edit' | 'delete' | 'system';
  user: string;
  model: string;
  version: string;
  ip: string;
  timestamp: string;
}

export interface SftpUser {
  id: number;
  username: string;
  role: 'admin' | 'downloader';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface DataContextType {
  models: Model[];
  firmwares: Firmware[];
  logs: Log[];
  addModel: (model: Omit<Model, 'id'>) => void;
  updateModel: (id: number, model: Partial<Model>) => void;
  deleteModel: (id: number) => void;
  addFirmware: (firmware: Omit<Firmware, 'id'>) => void;
  updateFirmware: (id: number, firmware: Partial<Firmware>) => void;
  deleteFirmware: (id: number) => void;
  addLog: (log: Omit<Log, 'id'>) => void;
  incrementDownload: (firmwareId: number) => void;
}

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
