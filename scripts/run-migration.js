import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function runMigration() {
  try {
    console.log('Running database migration: add-allowed-models.sql');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'add-allowed-models.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Column already exists, migration skipped');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

runMigration();

