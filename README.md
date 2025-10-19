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

### Technical Features
- **AWS Integration**: S3 storage for firmware files with organized folder structure
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
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │   Authentication│    │   Activity Logs │
│   AWS S3        │    │   Session-based │    │   Real-time     │
│   Organized     │    │   Admin Access  │    │   Tracking      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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
   ```

5. **Start development servers**
   ```bash
   npm run dev:full
   ```

6. **Access the application**
   - Frontend: http://localhost:5174
   - API: http://localhost:3001/api
   - Admin Login: `crane@dy.co.kr` / `1234`

## 📚 Documentation

- **[API Documentation](docs/api/README.md)** - Complete REST API reference
- **[Database Schema](docs/database/README.md)** - Database structure and management
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment instructions
- **[Development Guide](docs/development/README.md)** - Development setup and workflow
- **[Release Notes](docs/RELEASE_NOTES.md)** - Version history and changelog

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start frontend development server
npm run server       # Start backend API server  
npm run dev:full     # Start both servers concurrently
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Scripts

```bash
npm run generate-dummies    # Generate dummy firmware data
npm run complete-reset      # Complete system reset
npm run verify-system      # Verify system integrity
```

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

For production deployment, see the [Deployment Guide](docs/deployment/README.md).

### Quick Production Setup

1. Set up production environment variables
2. Build the application: `npm run build`
3. Configure reverse proxy (Nginx)
4. Set up process management (PM2)
5. Configure SSL certificates
6. Set up monitoring and logging

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