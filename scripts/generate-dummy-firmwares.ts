import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { FetchHttpHandler } from '@aws-sdk/fetch-http-handler';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const region = 'ap-northeast-2';
const bucketName = 'dy-craneeyes-firmware';
const accessKeyId = 'AKIASXKDVEWA4LUHWS5Y';
const secretAccessKey = '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';

// Initialize S3 client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// Model data from database
const models = [
  { id: 1, name: 'SS1416', category: 'Stick Crane', subCategory: '5T' },
  { id: 2, name: 'SS1406', category: 'Stick Crane', subCategory: '5T' },
  { id: 3, name: 'SS1926', category: 'Stick Crane', subCategory: '5T' },
  { id: 4, name: 'SS2036Ace', category: 'Stick Crane', subCategory: '7T' },
  { id: 5, name: 'SS2037Ace', category: 'Stick Crane', subCategory: '7T' },
  { id: 6, name: 'ST2216', category: 'Stick Crane', subCategory: '7T' },
  { id: 7, name: 'ST2217', category: 'Stick Crane', subCategory: '7T' },
  { id: 8, name: 'SS2037D', category: 'Stick Crane', subCategory: '7T' },
  { id: 9, name: 'ST2217D', category: 'Stick Crane', subCategory: '7T' },
  { id: 10, name: 'ST2507', category: 'Stick Crane', subCategory: '10T' },
  { id: 11, name: 'SS2725LB', category: 'Stick Crane', subCategory: '10T' },
  { id: 12, name: 'SS3506', category: 'Stick Crane', subCategory: '10T' },
  { id: 13, name: 'SS3506M', category: 'Stick Crane', subCategory: '10T' },
  { id: 14, name: 'SM7016', category: 'Stick Crane', subCategory: '20T' },
  { id: 15, name: 'SS75065', category: 'Stick Crane', subCategory: '20T' },
  { id: 16, name: 'ST7516', category: 'Stick Crane', subCategory: '20T' },
  { id: 17, name: 'SSN2200A-PRO', category: 'Knuckle Crane', subCategory: '' },
  { id: 18, name: 'SSN2200III', category: 'Knuckle Crane', subCategory: '' },
  { id: 19, name: 'SSN2800III', category: 'Knuckle Crane', subCategory: '' },
  { id: 20, name: 'SSN3000', category: 'Knuckle Crane', subCategory: '' },
];

// Generate firmware file content
function generateFirmwareContent(model: typeof models[0], version: string, releaseDate: string): string {
  return `╔══════════════════════════════════════════════════════════════╗
║         CRANEEYES FIRMWARE MANAGEMENT SYSTEM                 ║
║                 Dummy Firmware File                          ║
╚══════════════════════════════════════════════════════════════╝

Model Information:
------------------
Model Name:      ${model.name}
Category:        ${model.category}
${model.subCategory ? `Sub-Category:   ${model.subCategory}` : ''}
Firmware ID:     ${model.name}-FW-${version.replace(/\./g, '')}

Firmware Details:
-----------------
Version:         ${version}
Release Date:    ${releaseDate}
Build Number:    ${Math.floor(Math.random() * 10000)}
Checksum:        ${Math.random().toString(36).substring(2, 15).toUpperCase()}

Description:
------------
Initial firmware release for ${model.name} model.
This is a dummy firmware file for testing and demonstration purposes.

Features:
---------
✓ Enhanced stability and performance
✓ Bug fixes from previous versions
✓ Improved safety mechanisms
✓ Extended battery life optimization
✓ Updated diagnostic capabilities

Installation Instructions:
--------------------------
1. Download this firmware file
2. Connect the crane control unit via USB/Serial interface
3. Open the CraneEyes Firmware Update Tool
4. Select this firmware file
5. Click "Update Firmware" and wait for completion
6. Restart the control unit after update

Technical Specifications:
-------------------------
Supported Models:     ${model.name}
Hardware Revision:    >= v1.0
Flash Memory Size:    ${Math.floor(Math.random() * 512 + 256)} KB
EEPROM Usage:         ${Math.floor(Math.random() * 32 + 8)} KB
Bootloader Version:   >= 2.0

Safety Notice:
--------------
⚠ Always ensure the crane is in a safe position before updating
⚠ Do not power off the device during firmware update
⚠ Keep backup of current firmware before updating
⚠ Contact support@craneeyes.com for assistance

Changelog:
----------
[${version}] - ${releaseDate}
- Initial release for ${model.name}
- Implemented core control algorithms
- Added safety checks and diagnostics
- Optimized power management
- Enhanced user interface responsiveness

Support Information:
--------------------
Website:     https://craneeyes.com
Email:       support@craneeyes.com
Phone:       +82-2-1234-5678
Documentation: https://docs.craneeyes.com

Legal Notice:
-------------
© 2025 CraneEyes Firmware Management System
All rights reserved.

This firmware is provided "as is" without warranty of any kind.
Use of this firmware is subject to the terms and conditions
outlined in the CraneEyes License Agreement.

END OF FIRMWARE FILE
═══════════════════════════════════════════════════════════════
File Size: ~2.5 KB | Format: UTF-8 Text | Type: Dummy Firmware
═══════════════════════════════════════════════════════════════
`;
}

// Upload firmware to S3
async function uploadToS3(model: typeof models[0], version: string, content: string): Promise<string> {
  const fileName = `${model.name}-firmware-v${version}.txt`;
  const s3Key = `firmwares/${model.name}/${version}/${fileName}`;
  
  console.log(`📤 Uploading: ${s3Key}`);
  
  const buffer = Buffer.from(content, 'utf-8');
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: buffer,
    ContentType: 'text/plain',
    ContentLength: buffer.length,
  });
  
  await s3Client.send(command);
  console.log(`✅ Uploaded: ${s3Key} (${buffer.length} bytes)`);
  
  return s3Key;
}

// Generate SQL INSERT statements
function generateSQLInsert(model: typeof models[0], version: string, releaseDate: string, s3Key: string, fileSize: string): string {
  const description = `Initial firmware release for ${model.name}`;
  return `((SELECT id FROM models WHERE name = '${model.name}'), '${version}', '${releaseDate}', '${fileSize}', 0, '${s3Key}', '${description}')`;
}

// Main function
async function main() {
  console.log('🚀 Starting dummy firmware generation and upload...\n');
  
  const sqlInserts: string[] = [];
  const uploadedFirmwares: any[] = [];
  
  for (const model of models) {
    const version = '1.0.0';
    const releaseDate = '2025-01-15';
    
    try {
      // Generate firmware content
      const content = generateFirmwareContent(model, version, releaseDate);
      
      // Upload to S3
      const s3Key = await uploadToS3(model, version, content);
      
      // Calculate file size
      const sizeInKB = (Buffer.from(content, 'utf-8').length / 1024).toFixed(2);
      const fileSize = `${sizeInKB} KB`;
      
      // Generate SQL
      const sqlInsert = generateSQLInsert(model, version, releaseDate, s3Key, fileSize);
      sqlInserts.push(sqlInsert);
      
      uploadedFirmwares.push({
        model: model.name,
        version,
        s3Key,
        size: fileSize
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to process ${model.name}:`, error);
    }
  }
  
  console.log('\n✅ All firmwares uploaded successfully!\n');
  console.log('📊 Summary:');
  console.log(`Total models: ${models.length}`);
  console.log(`Successfully uploaded: ${uploadedFirmwares.length}`);
  
  // Write SQL to file
  const sqlContent = `-- Auto-generated firmware INSERT statements
-- Run this to populate the database with dummy firmwares

INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description) VALUES
${sqlInserts.join(',\n')}
ON CONFLICT (model_id, version) DO NOTHING;

-- Update firmware counts
UPDATE models SET firmware_count = (
    SELECT COUNT(*) FROM firmwares WHERE firmwares.model_id = models.id
);
`;
  
  const sqlFilePath = path.join(process.cwd(), 'database', 'insert-dummy-firmwares.sql');
  fs.writeFileSync(sqlFilePath, sqlContent);
  console.log(`\n📝 SQL file generated: ${sqlFilePath}`);
  
  // Write summary to JSON
  const summaryPath = path.join(process.cwd(), 'scripts', 'uploaded-firmwares.json');
  fs.writeFileSync(summaryPath, JSON.stringify(uploadedFirmwares, null, 2));
  console.log(`📝 Summary JSON: ${summaryPath}`);
  
  console.log('\n🎉 Done! Now run the SQL file to update the database.');
}

main().catch(console.error);

