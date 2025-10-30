import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection
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

// Users to create with their model assignments
const users = [
  // Admins
  {
    username: 'crane_admin1',
    password: 'admin001',
    role: 'admin',
    allowedModels: ['SS1406', 'SS1416', 'SS1926', 'SS2036Ace', 'SS2037Ace', 'SS2037D', 'SS2725LB', 'SS3506', 'SS3506M', 'SS75065', 'SSN2200A-PRO']
  },
  {
    username: 'crane_admin2',
    password: 'admin002',
    role: 'admin',
    allowedModels: ['SSN2200III', 'SSN2800III', 'SSN3000', 'ST2216', 'ST2217', 'ST2217D', 'ST2507', 'ST7516', 'SM7016']
  },
  
  // Downloaders
  {
    username: 'crane_dl1',
    password: 'dl001',
    role: 'downloader',
    allowedModels: ['SS1406', 'SS1416']
  },
  {
    username: 'crane_dl2',
    password: 'dl002',
    role: 'downloader',
    allowedModels: ['SS1926', 'SS2036Ace', 'SS2037Ace', 'SS2037D']
  },
  {
    username: 'crane_dl3',
    password: 'dl003',
    role: 'downloader',
    allowedModels: ['SS2725LB', 'SS3506', 'SS3506M', 'SS75065']
  },
  {
    username: 'crane_dl4',
    password: 'dl004',
    role: 'downloader',
    allowedModels: ['SSN2200A-PRO', 'SSN2200III', 'SSN2800III', 'SSN3000']
  },
  {
    username: 'crane_dl5',
    password: 'dl005',
    role: 'downloader',
    allowedModels: ['ST2216', 'ST2217', 'ST2217D', 'ST2507', 'ST7516', 'SM7016']
  }
];

async function createUsers() {
  try {
    console.log('Starting SFTP user creation with model assignments...\n');

    for (const user of users) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert user
        const query = `
          INSERT INTO sftp_users (username, password, role, enabled, allowed_models)
          VALUES ($1, $2, $3, true, $4)
          ON CONFLICT (username) DO UPDATE 
          SET password = $2, role = $3, allowed_models = $4, updated_at = NOW()
          RETURNING id, username, role, allowed_models
        `;

        const result = await pool.query(query, [
          user.username,
          hashedPassword,
          user.role,
          user.allowedModels
        ]);

        console.log(`✅ Created/Updated: ${result.rows[0].username}`);
        console.log(`   Role: ${result.rows[0].role}`);
        console.log(`   Models: ${result.rows[0].allowed_models.join(', ')}`);
        console.log(`   Password: ${user.password}\n`);
      } catch (error) {
        console.error(`❌ Failed to create user ${user.username}:`, error.message);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SFTP User Creation Summary');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Display connection info
    console.log('Admin Accounts (Read/Write):');
    console.log('  crane_admin1 / admin001');
    console.log('    - SS series (11 models)');
    console.log('  crane_admin2 / admin002');
    console.log('    - ST, SSN, SM series (9 models)\n');
    
    console.log('Downloader Accounts (Read-Only):');
    console.log('  crane_dl1 / dl001 - SS14xx series');
    console.log('  crane_dl2 / dl002 - SS19xx/20xx series');
    console.log('  crane_dl3 / dl003 - SS other models');
    console.log('  crane_dl4 / dl004 - SSN series');
    console.log('  crane_dl5 / dl005 - ST + SM series\n');
    
    console.log('Connection:');
    console.log('  sftp -P 2222 [username]@firmware.craneeyes.com');
    console.log('  or: sftp -P 2222 [username]@54.180.29.96\n');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createUsers();

