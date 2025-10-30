import { SftpUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * SFTP Users Service
 * Handles all API calls for SFTP user management
 */
class SftpUsersService {
  /**
   * Fetch all SFTP users
   */
  async getAll(): Promise<SftpUser[]> {
    const response = await fetch(`${API_BASE_URL}/sftp-users`);
    if (!response.ok) {
      throw new Error('Failed to fetch SFTP users');
    }
    return response.json();
  }

  /**
   * Create new SFTP user
   */
  async create(username: string, password: string, role: 'admin' | 'downloader', allowedModels: string[] = []): Promise<SftpUser> {
    const response = await fetch(`${API_BASE_URL}/sftp-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role, allowedModels }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create SFTP user');
    }

    return response.json();
  }

  /**
   * Update SFTP user
   */
  async update(id: number, data: { password?: string; role?: 'admin' | 'downloader'; allowedModels?: string[] }): Promise<SftpUser> {
    const response = await fetch(`${API_BASE_URL}/sftp-users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update SFTP user');
    }

    return response.json();
  }

  /**
   * Toggle SFTP user enabled status
   */
  async toggle(id: number): Promise<SftpUser> {
    const response = await fetch(`${API_BASE_URL}/sftp-users/${id}/toggle`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle SFTP user');
    }

    return response.json();
  }

  /**
   * Delete SFTP user
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sftp-users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete SFTP user');
    }
  }
}

export const sftpUsersService = new SftpUsersService();

