/**
 * S3 Service (Secure - using backend API proxy)
 * All AWS credentials are kept server-side only
 * Browser never has access to AWS keys
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class S3Service {
  constructor() {
    console.log('🔧 S3Service: Initialized with secure backend proxy');
  }

  /**
   * Upload firmware file to S3 via backend API
   */
  async uploadFirmware(file: File, modelName: string, version: string): Promise<string> {
    console.log('🚀 S3Service: Starting upload via backend API');
    console.log('📁 S3Service: File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });
    console.log('🏷️ S3Service: Upload params:', { modelName, version });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modelName', modelName);
      formData.append('version', version);

      const response = await fetch(`${API_BASE_URL}/s3/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('✅ S3Service: Upload successful:', result.key);
      return result.key;
    } catch (error) {
      console.error('❌ S3Service: Upload error:', error);
      throw error;
    }
  }

  /**
   * Get presigned download URL for a file
   */
  async getDownloadUrl(s3Key: string): Promise<string> {
    console.log('🔗 S3Service: Getting download URL for:', s3Key);

    try {
      const response = await fetch(`${API_BASE_URL}/s3/download-url?key=${encodeURIComponent(s3Key)}`);

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('❌ S3Service: Download URL error:', error);
      throw error;
    }
  }

  /**
   * Delete firmware file from S3
   */
  async deleteFirmware(s3Key: string): Promise<void> {
    console.log('🗑️ S3Service: Deleting file:', s3Key);

    try {
      const response = await fetch(`${API_BASE_URL}/s3/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: s3Key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      console.log('✅ S3Service: Delete successful');
    } catch (error) {
      console.error('❌ S3Service: Delete error:', error);
      throw error;
    }
  }

  /**
   * Delete all firmware files for a specific model and version
   */
  async deleteFirmwareVersion(modelName: string, version: string): Promise<void> {
    console.log(`🗑️ S3Service: Deleting all files for ${modelName} v${version}`);

    try {
      // First, list all files in this version directory
      const prefix = `firmwares/${modelName}/${version}/`;
      const listResponse = await fetch(`${API_BASE_URL}/s3/list?prefix=${encodeURIComponent(prefix)}`);
      
      if (!listResponse.ok) {
        throw new Error('Failed to list files');
      }

      const { files } = await listResponse.json();
      
      if (files.length === 0) {
        console.log('⚠️ S3Service: No files found to delete');
        return;
      }

      const keys = files.map((f: any) => f.key);

      // Delete all files
      const deleteResponse = await fetch(`${API_BASE_URL}/s3/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Bulk delete failed');
      }

      console.log(`✅ S3Service: Deleted ${keys.length} files`);
    } catch (error) {
      console.error('❌ S3Service: Bulk delete error:', error);
      throw error;
    }
  }

  /**
   * List files in S3 with optional prefix
   */
  async listFiles(prefix?: string): Promise<{ folders: any[]; files: any[] }> {
    console.log('📋 S3Service: Listing files with prefix:', prefix || '(none)');

    try {
      const url = prefix 
        ? `${API_BASE_URL}/s3/list?prefix=${encodeURIComponent(prefix)}`
        : `${API_BASE_URL}/s3/list`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const result = await response.json();
      console.log(`✅ S3Service: Found ${result.folders.length} folders, ${result.files.length} files`);
      return result;
    } catch (error) {
      console.error('❌ S3Service: List error:', error);
      throw error;
    }
  }

  /**
   * Get file size and metadata
   */
  async getFileMetadata(s3Key: string): Promise<{ size: number; lastModified: Date }> {
    console.log('📊 S3Service: Getting metadata for:', s3Key);

    try {
      // Use list API with specific prefix to get file metadata
      const response = await fetch(`${API_BASE_URL}/s3/list?prefix=${encodeURIComponent(s3Key)}`);

      if (!response.ok) {
        throw new Error('Failed to get file metadata');
      }

      const { files } = await response.json();
      const file = files.find((f: any) => f.key === s3Key);

      if (!file) {
        throw new Error('File not found');
      }

      return {
        size: file.size,
        lastModified: new Date(file.lastModified),
      };
    } catch (error) {
      console.error('❌ S3Service: Metadata error:', error);
      throw error;
    }
  }

  /**
   * Delete all firmwares from S3 (DANGEROUS - use with caution)
   */
  async deleteAllFirmwares(): Promise<void> {
    console.log('⚠️ S3Service: Deleting ALL firmwares');

    try {
      // List all files in firmwares/
      const response = await fetch(`${API_BASE_URL}/s3/list?prefix=firmwares/`);
      
      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const { files } = await response.json();
      
      if (files.length === 0) {
        console.log('✅ S3Service: No files to delete');
        return;
      }

      const keys = files.map((f: any) => f.key);

      // Delete all files
      const deleteResponse = await fetch(`${API_BASE_URL}/s3/delete-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Bulk delete failed');
      }

      console.log(`✅ S3Service: Deleted all ${keys.length} firmware files`);
    } catch (error) {
      console.error('❌ S3Service: Delete all error:', error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

export const s3Service = new S3Service();
