# CraneEyes Firmware Manager

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/your-org/craneeyes-firmware-manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A comprehensive web-based firmware management system for CraneEyes crane models. This platform enables public users to browse and download firmware files while providing administrators with powerful tools to manage models, upload firmware, and track system activity.

## 🚀 Features

### Public Portal
- **Firmware Browser**: Browse firmware by crane model and category
- **Secure Downloads**: Direct file downloads with download tracking
- **Model Organization**: Organized by crane categories (Stick Crane, Knuckle Crane)
- **UTF-8 Support**: Full support for Korean filenames and descriptions

### Admin Panel
- **Firmware Management**: Upload, edit, and delete firmware files
- **Model Management**: Manage crane model information
- **Activity Logs**: Track all system activities and downloads
- **Dashboard**: Overview of system statistics and recent activity
- **Complete Reset**: Bulk operations for system maintenance
- **FTP Account Management**: Create and manage SFTP users with role-based access

### Technical Features
- **AWS Integration**: S3 storage for firmware files with organized folder structure
- **SFTP Server**: Secure file transfer protocol with S3 backend
- **Role-Based Access**: Admin (read/write) and Downloader (read-only) roles
- **Real-time Database**: PostgreSQL with AWS RDS for metadata storage
- **API-driven**: RESTful API architecture with Express.js backend
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📊 System Overview

- **20 Crane Models** across 2 categories
- **21 Firmware Files** with complete metadata
- **Real-time Activity Logging** for all operations
- **Secure File Storage** with AWS S3 integration
- **Database-driven** with PostgreSQL and AWS RDS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │◄──►│   Express.js    │◄──►│   PostgreSQL    │
│   Vite + Tailwind│    │   REST API      │    │   AWS RDS       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────┴────────┐              │
         ▼              ▼                 ▼              ▼
┌─────────────────┐    ┌──────────┐    ┌──────────┐    ┌─────────────────┐
│   File Storage  │    │   SFTP   │    │   Auth   │    │   Activity Logs │
│   AWS S3        │◄──►│  Server  │    │  Session │    │   Real-time     │
│   Organized     │    │  ssh2    │    │  Based   │    │   Tracking      │
└─────────────────┘    └──────────┘    └──────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (AWS RDS recommended)
- AWS S3 bucket
- AWS credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd craneeyes-firmware-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create database and tables
   psql -h your-db-host -U postgres -d crane_firmware < database/create_db.sql
   
   # Insert initial data
   psql -h your-db-host -U postgres -d crane_firmware < database/init.sql
   
   # Add SFTP users table
   psql -h your-db-host -U postgres -d crane_firmware < database/add-sftp-users.sql
   ```

5. **Start development servers**
   ```bash
   # Start API and frontend only
   npm run dev:full
   
   # Or start all services including SFTP
   npm run dev:all
   ```

6. **Access the application**
   - Frontend: http://localhost:5174
   - API: http://localhost:3001/api
   - SFTP: Port 2222
   - Admin Login: `crane@dy.co.kr` / `1234`

## 📚 Documentation

- **[API Documentation](docs/api/README.md)** - Complete REST API reference
- **[Database Schema](docs/database/README.md)** - Database structure and management
- **[CI/CD Guide](docs/CI_CD_GUIDE.md)** - Automated deployment pipeline
- **[SSL Setup Guide](docs/SSL_SETUP_GUIDE.md)** - HTTPS/SSL configuration with Let's Encrypt
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment instructions
- **[Development Guide](docs/development/README.md)** - Development setup and workflow
- **[SFTP Guide](docs/SFTP_GUIDE.md)** - SFTP server setup and usage
- **[Release Notes](docs/RELEASE_NOTES.md)** - Version history and changelog

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend API server
npm run sftp         # Start SFTP server
npm run dev:full     # Start API and frontend
npm run dev:all      # Start all services (API, SFTP, frontend)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Scripts

```bash
npm run generate-dummies    # Generate dummy firmware data
npm run complete-reset      # Complete system reset
npm run verify-system      # Verify system integrity
```

## 🔐 SFTP Access

The system includes a built-in SFTP server that provides secure file transfer access to firmware files stored in S3.

### User Roles

- **Admin**: Full access - upload, download, and delete firmware files
- **Downloader**: Read-only access - browse and download firmware files only

### Managing SFTP Users

1. **Via Web Interface**: Navigate to Admin Panel → FTP 계정
2. **Create Users**: Add new SFTP accounts with username, password, and role
3. **Manage Access**: Enable/disable accounts or change roles as needed

### Connecting via SFTP

```bash
# Connect to SFTP server
sftp -P 2222 username@your-server-ip

# Example commands
sftp> ls /firmwares                          # List firmware files
sftp> cd /firmwares/SS1416/v1.0             # Navigate to directory
sftp> get firmware.bin                       # Download file (all users)
sftp> put new-firmware.bin                   # Upload file (admin only)
sftp> rm old-firmware.bin                    # Delete file (admin only)
```

### Security Notes

- All SFTP connections are encrypted via SSH protocol
- Passwords are hashed using bcrypt
- Role-based access control enforces read/write permissions
- Failed authentication attempts are logged

## 🔧 Configuration

### Environment Variables

```env
# AWS S3 Configuration
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_AWS_BUCKET_NAME=your-bucket-name

# Database Configuration
VITE_AWS_DB_HOST=your-rds-endpoint
VITE_AWS_DB_PORT=5432
VITE_AWS_DB_NAME=crane_firmware
VITE_AWS_DB_USER=postgres
VITE_AWS_DB_PASSWORD=your-password

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
API_PORT=3001
```

## 📁 Project Structure

```
craneeyes-firmware-manager/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   ├── services/          # API and service integrations
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── docs/                  # Documentation
│   ├── api/               # API documentation
│   ├── database/          # Database documentation
│   ├── deployment/        # Deployment guides
│   └── development/       # Development guides
├── database/              # Database scripts
├── scripts/               # Development scripts
├── server.js              # Express.js backend
└── package.json           # Project configuration
```

## 🔒 Security

- **SSL/TLS**: All database connections encrypted
- **Environment Variables**: Sensitive data in environment variables
- **Input Validation**: All inputs validated and sanitized
- **CORS Configuration**: Proper cross-origin resource sharing
- **File Type Validation**: Strict file type checking for uploads

## 🚀 Deployment

### Automated CI/CD

The project uses **GitHub Actions** for automated deployment:

- **CI (Pull Requests)**: Automatic code validation and build testing
- **CD (main branch)**: Automatic deployment to EC2 production server

**Deployment Flow**:
```
Code Push → Build → Test → Deploy to EC2 → Health Check → ✅ Live
```

See the [CI/CD Guide](docs/CI_CD_GUIDE.md) for details.

### Manual Deployment

For manual deployment, see the [Deployment Guide](docs/deployment/README.md).

**Quick Deploy**:
```bash
# On EC2
cd /home/ec2-user/craneeyes-firmware-manager
./deploy.sh
```

### Production Setup

1. Set up production environment variables
2. Configure GitHub Secrets (automated via `scripts/setup-github-secrets.sh`)
3. Push to `main` branch (automatic deployment)
4. Verify deployment in GitHub Actions
5. Monitor services via PM2

## 📊 Monitoring

- **Health Checks**: API health endpoint monitoring
- **Activity Logs**: Real-time activity tracking
- **Performance Metrics**: Database and API performance monitoring
- **Error Tracking**: Comprehensive error logging and handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Update documentation as needed
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow existing code style and patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **API Reference**: See [API Documentation](docs/api/README.md)

## 🎯 Roadmap

- [ ] Enhanced user authentication system
- [ ] Advanced admin features and analytics
- [ ] Mobile application support
- [ ] Additional file format support
- [ ] Automated testing framework
- [ ] Performance optimization
- [ ] Multi-language support

---

**CraneEyes Firmware Manager v0.1.0** - Built with ❤️ for efficient firmware management