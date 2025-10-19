import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FetchHttpHandler } from '@aws-sdk/fetch-http-handler';

class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({
      region: import.meta.env.VITE_AWS_REGION as string,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID as string,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY as string,
      },
      // 브라우저 환경을 명시적으로 설정하여 스트림 문제 방지
      requestHandler: new FetchHttpHandler({
        requestTimeout: 300000, // 5분 타임아웃
      }) as any,
      // 청크 업로드 완전 비활성화
      maxAttempts: 1,
      // @ts-ignore - 브라우저 환경 강제 설정
      useDualstackEndpoint: false,
      useAccelerateEndpoint: false,
    });
    this.bucketName = import.meta.env.VITE_AWS_BUCKET_NAME as string;
    console.log('🔧 S3Service: Initialized with FetchHttpHandler for browser compatibility');
    console.log('🔧 S3Service: Chunked upload and checksums disabled');
  }

  // Upload firmware file (supports .bin, .pdf, .zip, .txt files)
  async uploadFirmware(file: File, modelName: string, version: string): Promise<string> {
    console.log('🚀 S3Service: Starting upload process');
    console.log('📁 S3Service: File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    console.log('🏷️ S3Service: Upload params:', { modelName, version });

    try {
      // PDF 파일도 허용하도록 확장
      const allowedTypes = [
        'application/octet-stream', // .bin files
        'application/pdf',         // .pdf files
        'application/zip',         // .zip files
        'text/plain'               // .txt files
      ];
      
      console.log('🔍 S3Service: Checking file type validation');
      console.log('📋 S3Service: File type:', file.type);
      console.log('📋 S3Service: File extension:', file.name.split('.').pop());
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.bin') && !file.name.endsWith('.pdf') && !file.name.endsWith('.zip') && !file.name.endsWith('.txt')) {
        console.error('❌ S3Service: File type not allowed');
        throw new Error('Only .bin, .pdf, .zip, and .txt files are allowed');
      }

      console.log('✅ S3Service: File type validation passed');

      const key = `firmwares/${modelName.replace(/\s/g, '-')}/${version}/${file.name}`;
      console.log('🔑 S3Service: Generated S3 key:', key);
      console.log('🪣 S3Service: Target bucket:', this.bucketName);

      // 파일을 Uint8Array로 변환하여 브라우저 환경 스트림 문제 해결
      console.log('🔄 S3Service: Converting file to Uint8Array (bypass middleware)');
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log('📊 S3Service: Uint8Array size:', uint8Array.byteLength);
      console.log('📊 S3Service: Content type:', file.type);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: uint8Array,
        ContentType: file.type || 'application/octet-stream',
        ContentLength: uint8Array.byteLength,
        // 체크섬 미들웨어를 완전히 우회
        ChecksumAlgorithm: undefined as any,
      });
      
      console.log('📤 S3Service: Sending upload command to S3 (without checksums)');
      
      // 미들웨어 스택을 우회하는 옵션 추가
      const result = await this.client.send(command, {
        // @ts-ignore - 체크섬 미들웨어 강제 비활성화
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      });
      console.log('✅ S3Service: Upload successful:', result);
      
      return key;
    } catch (error) {
      console.error('❌ S3Service: Upload failed:', error);
      if (error instanceof Error) {
        console.error('❌ S3Service: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  // Generate presigned download URL (expires in 1 hour)
  async getDownloadUrl(s3Key: string): Promise<string> {
    console.log('🔗 S3Service: Generating download URL');
    console.log('🔑 S3Service: S3 key:', s3Key);
    console.log('🪣 S3Service: Bucket:', this.bucketName);

    try {
      // Extract filename from S3 key
      const originalFilename = s3Key.split('/').pop() || 'firmware.txt';
      
      // Use RFC 5987 encoding for UTF-8 filenames
      const encodedFilename = encodeURIComponent(originalFilename);
      const contentDisposition = `attachment; filename*=UTF-8''${encodedFilename}`;
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        ResponseContentDisposition: contentDisposition,
        ResponseContentType: 'application/octet-stream',
      });
      
      console.log('📤 S3Service: Creating presigned URL with RFC 5987 encoding');
      console.log('📁 S3Service: Original filename:', originalFilename);
      console.log('📁 S3Service: Encoded filename:', encodedFilename);
      
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      console.log('✅ S3Service: Download URL generated successfully');
      console.log('🔗 S3Service: URL length:', url.length);

      return url;
    } catch (error) {
      console.error('❌ S3Service: Failed to generate download URL:', error);
      if (error instanceof Error) {
        console.error('❌ S3Service: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }


  // Delete firmware file from S3
  async deleteFirmware(s3Key: string): Promise<void> {
    console.log('🗑️ S3Service: Starting delete process');
    console.log('🔑 S3Service: S3 key:', s3Key);
    console.log('🪣 S3Service: Bucket:', this.bucketName);

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      console.log('📤 S3Service: Sending delete command to S3');
      const result = await this.client.send(command);
      console.log('✅ S3Service: Delete successful:', result);
    } catch (error) {
      console.error('❌ S3Service: Delete failed:', error);
      if (error instanceof Error) {
        console.error('❌ S3Service: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  // Delete all firmware files from S3
  async deleteAllFirmwares(): Promise<void> {
    console.log('🗑️ S3Service: Starting bulk delete of all firmwares');
    console.log('🪣 S3Service: Bucket:', this.bucketName);

    try {
      // List all objects in firmwares/ folder
      console.log('📋 S3Service: Listing all firmware files...');
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'firmwares/',
      });

      const listResult = await this.client.send(listCommand);
      const objects = listResult.Contents || [];

      if (objects.length === 0) {
        console.log('✅ S3Service: No firmware files found to delete');
        return;
      }

      console.log(`📊 S3Service: Found ${objects.length} files to delete`);

      // Prepare delete objects
      const deleteObjects = objects.map(obj => ({
        Key: obj.Key!
      }));

      // Delete all objects in batch
      console.log('🗑️ S3Service: Deleting all firmware files...');
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: deleteObjects,
          Quiet: false,
        },
      });

      const deleteResult = await this.client.send(deleteCommand);
      console.log('✅ S3Service: Bulk delete completed');
      console.log('📊 S3Service: Deleted files:', deleteResult.Deleted?.length || 0);
      
      if (deleteResult.Errors && deleteResult.Errors.length > 0) {
        console.warn('⚠️ S3Service: Some files failed to delete:', deleteResult.Errors);
      }
    } catch (error) {
      console.error('❌ S3Service: Bulk delete failed:', error);
      if (error instanceof Error) {
        console.error('❌ S3Service: Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const s3Service = new S3Service();
