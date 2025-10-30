import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

/**
 * SFTP-S3 Bridge Service
 * Translates SFTP operations to S3 operations
 * Enforces role-based access control
 */
export class SftpS3BridgeService {
  constructor(region, accessKeyId, secretAccessKey, bucketName) {
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
    console.log('🔧 SFTP-S3 Bridge: Initialized');
  }

  /**
   * Check if user has permission for the operation
   */
  checkPermission(user, operation) {
    if (user.role === 'admin') {
      return true; // Admin can do everything
    }
    if (user.role === 'downloader' && operation === 'read') {
      return true; // Downloader can only read
    }
    return false;
  }

  /**
   * Extract model name from path
   * Examples: /firmwares/SS1406/file.bin -> SS1406, firmwares/SS1406/ -> SS1406
   */
  extractModelName(path) {
    // Normalize path first
    const normalized = this.normalizeS3Path(path);
    
    // Extract model name from path: firmwares/MODEL_NAME/...
    const parts = normalized.split('/').filter(p => p);
    
    // parts[0] should be 'firmwares', parts[1] should be the model name
    if (parts.length >= 2 && parts[0] === 'firmwares') {
      return parts[1];
    }
    
    return null;
  }

  /**
   * Check if user has access to the specified model
   */
  checkModelAccess(user, path) {
    const allowedModels = user.allowedModels || [];
    
    // Empty array means access to all models
    if (allowedModels.length === 0) {
      return true;
    }
    
    const modelName = this.extractModelName(path);
    
    // If we can't extract a model name, deny access by default
    if (!modelName) {
      return false;
    }
    
    // Check if the model is in the allowed list
    const hasAccess = allowedModels.includes(modelName);
    
    if (!hasAccess) {
      console.log(`⛔ SFTP-S3 Bridge: User ${user.username} denied access to model ${modelName}`);
    }
    
    return hasAccess;
  }

  /**
   * Normalize S3 path (remove leading slash, ensure it's within firmwares/)
   */
  normalizeS3Path(path) {
    // Remove leading slash
    let normalized = path.startsWith('/') ? path.slice(1) : path;
    
    // If path is empty or root, default to firmwares/
    if (!normalized || normalized === '/' || normalized === '') {
      normalized = 'firmwares/';
      return normalized;
    }
    
    // If already starts with 'firmwares/', don't add it again
    if (normalized.startsWith('firmwares/') || normalized.startsWith('firmwares')) {
      // Ensure trailing slash for directories if needed
      if (!normalized.endsWith('/') && !normalized.includes('.')) {
        normalized = normalized + '/';
      }
      return normalized.startsWith('firmwares/') ? normalized : 'firmwares/' + normalized.slice(9);
    }
    
    // Add firmwares/ prefix
    normalized = 'firmwares/' + normalized;
    
    return normalized;
  }

  /**
   * Read file from S3
   */
  async readFile(user, path) {
    console.log(`📖 SFTP-S3 Bridge: Read file requested by ${user.username} (${user.role}): ${path}`);
    
    if (!this.checkPermission(user, 'read')) {
      console.error(`❌ SFTP-S3 Bridge: Permission denied for ${user.username}`);
      throw new Error('Permission denied');
    }

    // Check model access
    if (!this.checkModelAccess(user, path)) {
      console.error(`❌ SFTP-S3 Bridge: Model access denied for ${user.username}`);
      throw new Error('Access denied to this model');
    }

    try {
      const s3Key = this.normalizeS3Path(path);
      console.log(`🔑 SFTP-S3 Bridge: S3 key: ${s3Key}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const response = await this.client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response from S3');
      }

      // Convert stream to buffer
      const chunks = [];
      const stream = response.Body;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      console.log(`✅ SFTP-S3 Bridge: File read successfully (${buffer.length} bytes)`);
      return buffer;
    } catch (error) {
      console.error(`❌ SFTP-S3 Bridge: Failed to read file:`, error);
      throw error;
    }
  }

  /**
   * Write file to S3
   */
  async writeFile(user, path, data) {
    console.log(`📝 SFTP-S3 Bridge: Write file requested by ${user.username} (${user.role}): ${path}`);
    
    if (!this.checkPermission(user, 'write')) {
      console.error(`❌ SFTP-S3 Bridge: Permission denied for ${user.username}`);
      throw new Error('Permission denied');
    }

    // Check model access
    if (!this.checkModelAccess(user, path)) {
      console.error(`❌ SFTP-S3 Bridge: Model access denied for ${user.username}`);
      throw new Error('Access denied to this model');
    }

    try {
      const s3Key = this.normalizeS3Path(path);
      console.log(`🔑 SFTP-S3 Bridge: S3 key: ${s3Key}, size: ${data.length} bytes`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: data,
        ContentType: this.getContentType(path),
      });

      await this.client.send(command);
      console.log(`✅ SFTP-S3 Bridge: File written successfully`);
    } catch (error) {
      console.error(`❌ SFTP-S3 Bridge: Failed to write file:`, error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(user, path) {
    console.log(`🗑️ SFTP-S3 Bridge: Delete file requested by ${user.username} (${user.role}): ${path}`);
    
    if (!this.checkPermission(user, 'delete')) {
      console.error(`❌ SFTP-S3 Bridge: Permission denied for ${user.username}`);
      throw new Error('Permission denied');
    }

    // Check model access
    if (!this.checkModelAccess(user, path)) {
      console.error(`❌ SFTP-S3 Bridge: Model access denied for ${user.username}`);
      throw new Error('Access denied to this model');
    }

    try {
      const s3Key = this.normalizeS3Path(path);
      console.log(`🔑 SFTP-S3 Bridge: S3 key: ${s3Key}`);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      await this.client.send(command);
      console.log(`✅ SFTP-S3 Bridge: File deleted successfully`);
    } catch (error) {
      console.error(`❌ SFTP-S3 Bridge: Failed to delete file:`, error);
      throw error;
    }
  }

  /**
   * Get file/directory attributes
   */
  async getAttributes(user, path) {
    console.log(`📊 SFTP-S3 Bridge: Get attributes requested by ${user.username}: ${path}`);
    
    if (!this.checkPermission(user, 'read')) {
      throw new Error('Permission denied');
    }

    try {
      const s3Key = this.normalizeS3Path(path);
      
      // Check if it's a directory (ends with /)
      if (s3Key.endsWith('/')) {
        return this.createDirectoryAttributes();
      }

      // Try to get file metadata
      try {
        const command = new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        });
        
        const response = await this.client.send(command);
        
        return {
          size: response.ContentLength || 0,
          mode: 0o100644, // Regular file
          mtime: response.LastModified ? Math.floor(response.LastModified.getTime() / 1000) : Date.now() / 1000,
          atime: Date.now() / 1000,
          uid: 1000,
          gid: 1000,
          isDirectory: false,
        };
      } catch {
        // If file doesn't exist, check if it's a directory prefix
        return this.createDirectoryAttributes();
      }
    } catch (error) {
      console.error(`❌ SFTP-S3 Bridge: Failed to get attributes:`, error);
      throw error;
    }
  }

  /**
   * List directory contents
   */
  async readdir(user, path) {
    console.log(`📁 SFTP-S3 Bridge: List directory requested by ${user.username}: ${path}`);
    
    if (!this.checkPermission(user, 'read')) {
      throw new Error('Permission denied');
    }

    try {
      const s3Prefix = this.normalizeS3Path(path);
      const prefix = s3Prefix.endsWith('/') ? s3Prefix : s3Prefix + '/';
      
      console.log(`🔑 SFTP-S3 Bridge: S3 prefix: ${prefix}`);
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await this.client.send(command);
      const entries = [];
      
      const allowedModels = user.allowedModels || [];
      const isRootListing = prefix === 'firmwares/';

      // Add subdirectories (CommonPrefixes)
      if (response.CommonPrefixes) {
        for (const commonPrefix of response.CommonPrefixes) {
          if (commonPrefix.Prefix) {
            const dirName = commonPrefix.Prefix.slice(prefix.length).replace('/', '');
            if (dirName) {
              // Filter model directories if we're at root level and user has restricted access
              if (isRootListing && allowedModels.length > 0) {
                if (!allowedModels.includes(dirName)) {
                  console.log(`🚫 SFTP-S3 Bridge: Filtering out ${dirName} for user ${user.username}`);
                  continue; // Skip this directory
                }
              }
              
              entries.push({
                filename: dirName,
                longname: `drwxr-xr-x 1 user group 0 ${new Date().toISOString().split('T')[0]} ${dirName}`,
                attrs: this.createDirectoryAttributes(),
              });
            }
          }
        }
      }

      // Add files (Contents)
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.Key !== prefix) {
            const fileName = object.Key.slice(prefix.length);
            if (fileName && !fileName.includes('/')) {
              const mtime = object.LastModified ? Math.floor(object.LastModified.getTime() / 1000) : Date.now() / 1000;
              const size = object.Size || 0;
              
              entries.push({
                filename: fileName,
                longname: `-rw-r--r-- 1 user group ${size} ${new Date(mtime * 1000).toISOString().split('T')[0]} ${fileName}`,
                attrs: {
                  size,
                  mode: 0o100644,
                  mtime,
                  atime: Date.now() / 1000,
                  uid: 1000,
                  gid: 1000,
                  isDirectory: false,
                },
              });
            }
          }
        }
      }

      console.log(`✅ SFTP-S3 Bridge: Listed ${entries.length} entries`);
      return entries;
    } catch (error) {
      console.error(`❌ SFTP-S3 Bridge: Failed to list directory:`, error);
      throw error;
    }
  }

  /**
   * Create directory attributes
   */
  createDirectoryAttributes() {
    return {
      size: 0,
      mode: 0o040755, // Directory
      mtime: Date.now() / 1000,
      atime: Date.now() / 1000,
      uid: 1000,
      gid: 1000,
      isDirectory: true,
    };
  }

  /**
   * Determine content type from file extension
   */
  getContentType(path) {
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypes = {
      'bin': 'application/octet-stream',
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'txt': 'text/plain',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
}

