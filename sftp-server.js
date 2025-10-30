import fs from 'fs';
import path from 'path';
import ssh2 from 'ssh2';
import { SftpS3BridgeService } from './src/services/sftp-s3-bridge.service.js';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { execSync } from 'child_process';

dotenv.config();

const { Server: SshServer } = ssh2;
const { Pool } = pg;

// Configuration
const SFTP_PORT = parseInt(process.env.SFTP_PORT || '2222');
const HOST_KEY_PATH = process.env.SFTP_HOST_KEY || './sftp-host-key';

// PostgreSQL connection for user authentication
const pool = new Pool({
  host: process.env.DB_HOST || process.env.VITE_AWS_DB_HOST,
  port: parseInt(process.env.DB_PORT || process.env.VITE_AWS_DB_PORT || '5432'),
  database: process.env.DB_NAME || process.env.VITE_AWS_DB_NAME,
  user: process.env.DB_USER || process.env.VITE_AWS_DB_USER,
  password: process.env.DB_PASSWORD || process.env.VITE_AWS_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize S3 Bridge (using backend-only env vars)
const s3Bridge = new SftpS3BridgeService(
  process.env.AWS_REGION,
  process.env.AWS_ACCESS_KEY_ID,
  process.env.AWS_SECRET_ACCESS_KEY,
  process.env.AWS_BUCKET_NAME
);

/**
 * Generate or load SSH host key
 */
function getHostKey() {
  if (fs.existsSync(HOST_KEY_PATH)) {
    console.log('🔑 SFTP Server: Loading existing host key');
    return fs.readFileSync(HOST_KEY_PATH);
  }
  
  console.log('🔑 SFTP Server: Generating new host key with ssh-keygen');
  try {
    // Generate OpenSSH format key using ssh-keygen
    execSync(`ssh-keygen -t rsa -b 2048 -f ${HOST_KEY_PATH} -N "" -m PEM`, { 
      stdio: 'pipe' 
    });
    console.log('✅ SFTP Server: Host key generated and saved');
    return fs.readFileSync(HOST_KEY_PATH);
  } catch (error) {
    console.error('❌ SFTP Server: Failed to generate host key with ssh-keygen:', error.message);
    console.log('⚠️  SFTP Server: Falling back to crypto.generateKeyPairSync');
    
    // Fallback to crypto if ssh-keygen is not available
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',  // Changed from pkcs8 to pkcs1
        format: 'pem'
      }
    });
    
    fs.writeFileSync(HOST_KEY_PATH, privateKey);
    console.log('✅ SFTP Server: Host key saved (crypto fallback)');
    return privateKey;
  }
}

/**
 * Authenticate user against database
 */
async function authenticateUser(username, password) {
  try {
    console.log(`🔐 SFTP Server: Authentication attempt for user: ${username}`);
    
    const query = `
      SELECT id, username, password, role, enabled, allowed_models 
      FROM sftp_users 
      WHERE username = $1
    `;
    const result = await pool.query(query, [username]);
    
    if (result.rows.length === 0) {
      console.log(`❌ SFTP Server: User not found: ${username}`);
      return null;
    }
    
    const user = result.rows[0];
    
    if (!user.enabled) {
      console.log(`❌ SFTP Server: User disabled: ${username}`);
      return null;
    }
    
    // Compare password with bcrypt hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log(`❌ SFTP Server: Invalid password for user: ${username}`);
      return null;
    }
    
    const allowedModels = user.allowed_models || [];
    console.log(`✅ SFTP Server: Authentication successful for ${username} (${user.role}) - ${allowedModels.length === 0 ? 'All models' : allowedModels.length + ' models'} allowed`);
    return {
      username: user.username,
      role: user.role,
      allowedModels: allowedModels
    };
  } catch (error) {
    console.error('❌ SFTP Server: Authentication error:', error);
    return null;
  }
}

/**
 * Handle SFTP session
 */
function handleSftpSession(accept, user) {
  console.log(`📂 SFTP Server: Starting SFTP session for ${user.username}`);
  
  const session = accept();
  
  session.on('OPEN', async (reqid, filename, flags, attrs) => {
    console.log(`📖 SFTP: OPEN ${filename} by ${user.username}`);
    
    try {
      // Check if it's a read or write operation
      const isWrite = (flags & 0x00000002) !== 0; // WRITE flag
      
      if (isWrite) {
        // For write operations, we'll handle the data in WRITE requests
        const handle = Buffer.from(`handle-${Date.now()}-${Math.random()}`);
        session.handle(reqid, handle);
        
        // Store file handle info for later writes
        if (!session.fileHandles) {
          session.fileHandles = new Map();
        }
        session.fileHandles.set(handle.toString(), {
          filename,
          data: Buffer.alloc(0)
        });
      } else {
        // Read operation
        const data = await s3Bridge.readFile(user, filename);
        const handle = Buffer.from(`handle-${Date.now()}-${Math.random()}`);
        session.handle(reqid, handle);
        
        if (!session.fileHandles) {
          session.fileHandles = new Map();
        }
        session.fileHandles.set(handle.toString(), {
          filename,
          data
        });
      }
    } catch (error) {
      console.error(`❌ SFTP: OPEN failed:`, error);
      session.status(reqid, 4); // SSH_FX_FAILURE
    }
  });
  
  session.on('READ', (reqid, handle, offset, length) => {
    try {
      const handleStr = handle.toString();
      const fileInfo = session.fileHandles?.get(handleStr);
      
      if (!fileInfo) {
        session.status(reqid, 4); // SSH_FX_FAILURE
        return;
      }
      
      const { data } = fileInfo;
      
      if (offset >= data.length) {
        session.status(reqid, 1); // SSH_FX_EOF
        return;
      }
      
      const chunk = data.slice(offset, offset + length);
      session.data(reqid, chunk);
    } catch (error) {
      console.error(`❌ SFTP: READ failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('WRITE', async (reqid, handle, offset, data) => {
    try {
      const handleStr = handle.toString();
      const fileInfo = session.fileHandles?.get(handleStr);
      
      if (!fileInfo) {
        session.status(reqid, 4);
        return;
      }
      
      // Append data to buffer
      const newData = Buffer.concat([fileInfo.data, data]);
      fileInfo.data = newData;
      session.fileHandles.set(handleStr, fileInfo);
      
      session.status(reqid, 0); // SSH_FX_OK
    } catch (error) {
      console.error(`❌ SFTP: WRITE failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('CLOSE', async (reqid, handle) => {
    try {
      const handleStr = handle.toString();
      const fileInfo = session.fileHandles?.get(handleStr);
      
      if (fileInfo && fileInfo.data.length > 0) {
        // This was a write operation, upload to S3
        await s3Bridge.writeFile(user, fileInfo.filename, fileInfo.data);
      }
      
      session.fileHandles?.delete(handleStr);
      session.status(reqid, 0); // SSH_FX_OK
    } catch (error) {
      console.error(`❌ SFTP: CLOSE failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('OPENDIR', async (reqid, path) => {
    console.log(`📁 SFTP: OPENDIR ${path} by ${user.username}`);
    
    try {
      const handle = Buffer.from(`dir-${Date.now()}-${Math.random()}`);
      const entries = await s3Bridge.readdir(user, path);
      
      if (!session.dirHandles) {
        session.dirHandles = new Map();
      }
      session.dirHandles.set(handle.toString(), {
        path,
        entries,
        index: 0
      });
      
      session.handle(reqid, handle);
    } catch (error) {
      console.error(`❌ SFTP: OPENDIR failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('READDIR', (reqid, handle) => {
    try {
      const handleStr = handle.toString();
      const dirInfo = session.dirHandles?.get(handleStr);
      
      if (!dirInfo) {
        session.status(reqid, 4);
        return;
      }
      
      if (dirInfo.index >= dirInfo.entries.length) {
        session.status(reqid, 1); // SSH_FX_EOF
        return;
      }
      
      // Send entries in chunks
      const chunk = dirInfo.entries.slice(dirInfo.index, dirInfo.index + 10);
      dirInfo.index += chunk.length;
      
      session.name(reqid, chunk);
    } catch (error) {
      console.error(`❌ SFTP: READDIR failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('REMOVE', async (reqid, path) => {
    console.log(`🗑️ SFTP: REMOVE ${path} by ${user.username}`);
    
    try {
      await s3Bridge.deleteFile(user, path);
      session.status(reqid, 0);
    } catch (error) {
      console.error(`❌ SFTP: REMOVE failed:`, error);
      session.status(reqid, 4);
    }
  });
  
  session.on('STAT', async (reqid, path) => {
    console.log(`📊 SFTP: STAT ${path} by ${user.username}`);
    
    try {
      const attrs = await s3Bridge.getAttributes(user, path);
      session.attrs(reqid, attrs);
    } catch (error) {
      console.error(`❌ SFTP: STAT failed:`, error);
      session.status(reqid, 2); // SSH_FX_NO_SUCH_FILE
    }
  });
  
  session.on('LSTAT', async (reqid, path) => {
    // Same as STAT for our virtual filesystem
    console.log(`📊 SFTP: LSTAT ${path} by ${user.username}`);
    
    try {
      const attrs = await s3Bridge.getAttributes(user, path);
      session.attrs(reqid, attrs);
    } catch (error) {
      console.error(`❌ SFTP: LSTAT failed:`, error);
      session.status(reqid, 2);
    }
  });
  
  session.on('REALPATH', (reqid, path) => {
    console.log(`🔗 SFTP: REALPATH ${path} by ${user.username}`);
    
    // Return normalized path
    const normalized = path === '.' || path === '/' ? '/firmwares' : path;
    session.name(reqid, [{
      filename: normalized,
      longname: `drwxr-xr-x 1 user group 0 ${new Date().toISOString().split('T')[0]} ${normalized}`,
      attrs: {
        mode: 0o040755,
        size: 0,
        uid: 1000,
        gid: 1000,
        mtime: Date.now() / 1000,
        atime: Date.now() / 1000
      }
    }]);
  });
}

/**
 * Start SFTP server
 */
function startServer() {
  const hostKey = getHostKey();
  
  const server = new SshServer({
    hostKeys: [hostKey]
  }, (client) => {
    console.log('🔌 SFTP Server: Client connected');
    
    client.on('authentication', async (ctx) => {
      console.log(`🔐 SFTP Server: Authentication request from ${ctx.username}`);
      
      if (ctx.method === 'password') {
        const user = await authenticateUser(ctx.username, ctx.password);
        
        if (user) {
          client.user = user; // Set user BEFORE accepting
          ctx.accept();
        } else {
          ctx.reject();
        }
      } else {
        ctx.reject(['password']);
      }
    });
    
    client.on('ready', () => {
      console.log(`✅ SFTP Server: Client authenticated as ${client.user.username}`);
      
      client.on('session', (accept, reject) => {
        const session = accept();
        
        session.on('sftp', (accept, reject) => {
          handleSftpSession(accept, client.user);
        });
      });
    });
    
    client.on('end', () => {
      console.log('👋 SFTP Server: Client disconnected');
    });
    
    client.on('error', (err) => {
      console.error('❌ SFTP Server: Client error:', err);
    });
  });
  
  server.listen(SFTP_PORT, '0.0.0.0', () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 CraneEyes SFTP Server Started');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📡 Port: ${SFTP_PORT}`);
    console.log(`🪣 S3 Bucket: ${process.env.VITE_AWS_BUCKET_NAME}`);
    console.log(`🔑 Host Key: ${HOST_KEY_PATH}`);
    console.log('');
    console.log('💡 Usage:');
    console.log(`   sftp -P ${SFTP_PORT} <username>@<server-ip>`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  });
  
  server.on('error', (err) => {
    console.error('❌ SFTP Server: Server error:', err);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SFTP Server: Received SIGTERM, shutting down...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SFTP Server: Received SIGINT, shutting down...');
  pool.end();
  process.exit(0);
});

// Start the server
startServer();

