// CraneEyes Firmware Manager - PM2 Ecosystem Configuration
// This file manages the backend server processes

module.exports = {
  apps: [
    {
      name: 'craneeyes-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3001
      },
      error_file: './logs/pm2-api-error.log',
      out_file: './logs/pm2-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    },
    {
      name: 'craneeyes-sftp',
      script: 'sftp-server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        SFTP_PORT: 2222
      },
      error_file: './logs/pm2-sftp-error.log',
      out_file: './logs/pm2-sftp-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ]
};

