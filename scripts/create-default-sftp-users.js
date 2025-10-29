import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  host: process.env.VITE_AWS_DB_HOST,
  port: parseInt(process.env.VITE_AWS_DB_PORT || '5432'),
  database: process.env.VITE_AWS_DB_NAME,
  user: process.env.VITE_AWS_DB_USER,
  password: process.env.VITE_AWS_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createDefaultUsers() {
  console.log('🔧 Creating default SFTP users...\n');
  
  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sftp_users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Error: sftp_users table does not exist.');
      console.log('💡 Please run: psql -h your-db-host -U postgres -d crane_firmware < database/add-sftp-users.sql');
      process.exit(1);
    }
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    try {
      await pool.query(`
        INSERT INTO sftp_users (username, password, role, enabled)
        VALUES ($1, $2, 'admin', true)
        ON CONFLICT (username) DO UPDATE SET password = $2
      `, ['sftpadmin', adminPassword]);
      console.log('✅ Created admin user:');
      console.log('   Username: sftpadmin');
      console.log('   Password: admin123');
      console.log('   Role: admin (read/write)');
      console.log('   ⚠️  IMPORTANT: Change this password immediately!\n');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
    }
    
    // Create downloader user
    const downloaderPassword = await bcrypt.hash('download123', 10);
    try {
      await pool.query(`
        INSERT INTO sftp_users (username, password, role, enabled)
        VALUES ($1, $2, 'downloader', true)
        ON CONFLICT (username) DO UPDATE SET password = $2
      `, ['downloader', downloaderPassword]);
      console.log('✅ Created downloader user:');
      console.log('   Username: downloader');
      console.log('   Password: download123');
      console.log('   Role: downloader (read-only)');
      console.log('   ⚠️  IMPORTANT: Change this password immediately!\n');
    } catch (error) {
      console.error('❌ Failed to create downloader user:', error.message);
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Default SFTP users created successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n💡 To connect via SFTP:');
    console.log(`   sftp -P ${process.env.SFTP_PORT || 2222} sftpadmin@your-server-ip`);
    console.log(`   sftp -P ${process.env.SFTP_PORT || 2222} downloader@your-server-ip`);
    console.log('\n💡 Manage users via Admin Panel → FTP 계정');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creating default users:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createDefaultUsers();

