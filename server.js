import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CraneEyes API Server is running' });
});

// Models endpoints
app.get('/api/models', async (req, res) => {
  try {
    const query = `
      SELECT id, name, category, sub_category as "subCategory", firmware_count as "firmwareCount"
      FROM models 
      ORDER BY category, name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/models', async (req, res) => {
  try {
    const { name, category, subCategory, firmwareCount } = req.body;
    const query = `
      INSERT INTO models (name, category, sub_category, firmware_count)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, category, sub_category as "subCategory", firmware_count as "firmwareCount"
    `;
    const result = await pool.query(query, [name, category, subCategory, firmwareCount || 0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding model:', error);
    res.status(500).json({ error: 'Failed to add model' });
  }
});

// Firmwares endpoints
app.get('/api/firmwares', async (req, res) => {
  try {
    const query = `
      SELECT 
        f.id,
        f.model_id as "modelId",
        m.name as "modelName",
        f.version,
        f.release_date as "releaseDate",
        f.size,
        f.downloads,
        f.s3_key as "s3Key",
        f.description
      FROM firmwares f
      JOIN models m ON f.model_id = m.id
      ORDER BY f.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching firmwares:', error);
    res.status(500).json({ error: 'Failed to fetch firmwares' });
  }
});

app.post('/api/firmwares', async (req, res) => {
  try {
    const { modelId, version, releaseDate, size, downloads, s3Key, description } = req.body;
    const query = `
      INSERT INTO firmwares (model_id, version, release_date, size, downloads, s3_key, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, model_id as "modelId", version, release_date as "releaseDate", size, downloads, s3_key as "s3Key", description
    `;
    const result = await pool.query(query, [modelId, version, releaseDate, size, downloads || 0, s3Key, description]);
    
    // Get model name for the response
    const modelQuery = `SELECT name FROM models WHERE id = $1`;
    const modelResult = await pool.query(modelQuery, [modelId]);
    
    const newFirmware = {
      ...result.rows[0],
      modelName: modelResult.rows[0].name
    };
    
    // Update model firmware count
    await pool.query(`
      UPDATE models 
      SET firmware_count = (
        SELECT COUNT(*) 
        FROM firmwares 
        WHERE model_id = $1
      )
      WHERE id = $1
    `, [modelId]);
    
    res.json(newFirmware);
  } catch (error) {
    console.error('Error adding firmware:', error);
    res.status(500).json({ error: 'Failed to add firmware' });
  }
});

app.put('/api/firmwares/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.version !== undefined) {
      fields.push(`version = $${paramIndex++}`);
      values.push(updates.version);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.downloads !== undefined) {
      fields.push(`downloads = $${paramIndex++}`);
      values.push(updates.downloads);
    }

    if (fields.length === 0) {
      return res.json({ message: 'No fields to update' });
    }

    const query = `UPDATE firmwares SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    values.push(id);

    await pool.query(query, values);
    res.json({ message: 'Firmware updated successfully' });
  } catch (error) {
    console.error('Error updating firmware:', error);
    res.status(500).json({ error: 'Failed to update firmware' });
  }
});

app.delete('/api/firmwares/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get firmware info before deletion to update model count
    const firmwareQuery = `SELECT model_id FROM firmwares WHERE id = $1`;
    const firmwareResult = await pool.query(firmwareQuery, [id]);
    
    if (firmwareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Firmware not found' });
    }

    const modelId = firmwareResult.rows[0].model_id;

    // Delete firmware
    await pool.query('DELETE FROM firmwares WHERE id = $1', [id]);

    // Update model firmware count
    await pool.query(`
      UPDATE models 
      SET firmware_count = (
        SELECT COUNT(*) 
        FROM firmwares 
        WHERE model_id = $1
      )
      WHERE id = $1
    `, [modelId]);

    res.json({ message: 'Firmware deleted successfully' });
  } catch (error) {
    console.error('Error deleting firmware:', error);
    res.status(500).json({ error: 'Failed to delete firmware' });
  }
});

app.post('/api/firmwares/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE firmwares SET downloads = downloads + 1 WHERE id = $1', [id]);
    res.json({ message: 'Download count incremented' });
  } catch (error) {
    console.error('Error incrementing download count:', error);
    res.status(500).json({ error: 'Failed to increment download count' });
  }
});

// Logs endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const query = `
      SELECT id, type, user_email as "user", model_name as "model", version, ip_address as "ip", timestamp
      FROM logs 
      ORDER BY timestamp DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { type, user, model, version, ip, timestamp } = req.body;
    const query = `
      INSERT INTO logs (type, user_email, model_name, version, ip_address, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, type, user_email as "user", model_name as "model", version, ip_address as "ip", timestamp
    `;
    const result = await pool.query(query, [type, user, model, version, ip, timestamp]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding log:', error);
    res.status(500).json({ error: 'Failed to add log' });
  }
});

// SFTP Users endpoints
app.get('/api/sftp-users', async (req, res) => {
  try {
    const query = `
      SELECT id, username, role, enabled, created_at as "createdAt", updated_at as "updatedAt"
      FROM sftp_users 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching SFTP users:', error);
    res.status(500).json({ error: 'Failed to fetch SFTP users' });
  }
});

app.post('/api/sftp-users', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }
    
    if (role !== 'admin' && role !== 'downloader') {
      return res.status(400).json({ error: 'Role must be either "admin" or "downloader"' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO sftp_users (username, password, role, enabled)
      VALUES ($1, $2, $3, true)
      RETURNING id, username, role, enabled, created_at as "createdAt", updated_at as "updatedAt"
    `;
    const result = await pool.query(query, [username, hashedPassword, role]);
    
    console.log(`✅ Created SFTP user: ${username} (${role})`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating SFTP user:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create SFTP user' });
    }
  }
});

app.put('/api/sftp-users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password, role } = req.body;
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    
    if (role) {
      if (role !== 'admin' && role !== 'downloader') {
        return res.status(400).json({ error: 'Role must be either "admin" or "downloader"' });
      }
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    values.push(id);
    const query = `
      UPDATE sftp_users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, username, role, enabled, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SFTP user not found' });
    }
    
    console.log(`✅ Updated SFTP user: ${result.rows[0].username}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating SFTP user:', error);
    res.status(500).json({ error: 'Failed to update SFTP user' });
  }
});

app.post('/api/sftp-users/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE sftp_users 
      SET enabled = NOT enabled
      WHERE id = $1
      RETURNING id, username, role, enabled, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'SFTP user not found' });
    }
    
    const user = result.rows[0];
    console.log(`✅ Toggled SFTP user: ${user.username} (enabled: ${user.enabled})`);
    res.json(user);
  } catch (error) {
    console.error('Error toggling SFTP user:', error);
    res.status(500).json({ error: 'Failed to toggle SFTP user' });
  }
});

app.delete('/api/sftp-users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get username before deletion for logging
    const selectQuery = 'SELECT username FROM sftp_users WHERE id = $1';
    const selectResult = await pool.query(selectQuery, [id]);
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'SFTP user not found' });
    }
    
    const username = selectResult.rows[0].username;
    
    // Delete user
    await pool.query('DELETE FROM sftp_users WHERE id = $1', [id]);
    
    console.log(`✅ Deleted SFTP user: ${username}`);
    res.json({ message: 'SFTP user deleted successfully' });
  } catch (error) {
    console.error('Error deleting SFTP user:', error);
    res.status(500).json({ error: 'Failed to delete SFTP user' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 CraneEyes API Server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
});
