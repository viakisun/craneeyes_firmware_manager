# Development Guide

## Overview

This guide covers setting up and developing the CraneEyes Firmware Manager application.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- PostgreSQL database access
- AWS S3 bucket access

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd craneeyes-firmware-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# AWS S3 Configuration
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_ACCESS_KEY_ID=your-access-key
VITE_AWS_SECRET_ACCESS_KEY=your-secret-key
VITE_AWS_BUCKET_NAME=your-bucket-name

# Database Configuration
VITE_AWS_DB_HOST=your-db-host
VITE_AWS_DB_PORT=5432
VITE_AWS_DB_NAME=crane_firmware
VITE_AWS_DB_USER=postgres
VITE_AWS_DB_PASSWORD=your-password

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
API_PORT=3001
```

### 4. Database Setup

Run database initialization scripts:

```bash
# Create database and tables
psql -h your-db-host -U postgres -d crane_firmware < database/create_db.sql

# Insert initial data
psql -h your-db-host -U postgres -d crane_firmware < database/init.sql
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev:full

# Or start separately
npm run server  # Backend API server
npm run dev     # Frontend development server
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   └── ui/             # Generic UI components (Modal, etc.)
├── context/            # React context providers
│   ├── AuthContext.tsx # Authentication state management
│   └── DataContext.tsx # Application data state management
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   ├── auth/           # Authentication pages
│   └── public/         # Public pages
├── services/           # External service integrations
│   ├── database.service.ts # API client for database operations
│   └── s3.service.ts   # AWS S3 integration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

server.js               # Express.js backend server
docs/                   # Documentation
database/               # Database scripts and schemas
scripts/                # Development and deployment scripts
```

## Development Workflow

### 1. Feature Development

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Run tests and linting: `npm run build`
4. Commit changes: `git commit -m "Add new feature"`
5. Push and create pull request

### 2. Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic

### 3. Testing

```bash
# Build and check for errors
npm run build

# Run type checking
npx tsc --noEmit

# Test API endpoints
curl http://localhost:3001/api/health
```

## API Development

### Backend Server (Express.js)

The backend server is located in `server.js` and provides RESTful API endpoints.

#### Adding New Endpoints

1. Add route handler in `server.js`
2. Implement database queries
3. Add error handling
4. Update API documentation

#### Example Endpoint

```javascript
app.get('/api/new-endpoint', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM table');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Frontend API Integration

Use the `database.service.ts` for API calls:

```typescript
// Example: Adding new API method
async getNewData(): Promise<NewDataType[]> {
  try {
    const data = await this.makeRequest<NewDataType[]>('/new-endpoint');
    return data;
  } catch (error) {
    console.error('Failed to fetch new data:', error);
    throw error;
  }
}
```

## Database Development

### Adding New Tables

1. Create migration script in `database/` folder
2. Update schema documentation
3. Test with sample data

### Example Migration

```sql
-- database/add_new_table.sql
CREATE TABLE new_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_new_table_name ON new_table(name);
```

## AWS S3 Integration

### File Upload Process

1. Frontend sends file to backend
2. Backend uploads to S3 with organized key structure
3. Backend saves metadata to database
4. Frontend receives confirmation

### S3 Key Structure

```
firmwares/{model_name}/{version}/{filename}
```

Example: `firmwares/SS1406/1.0.0/firmware.bin`

## Debugging

### Frontend Debugging

1. Use browser DevTools
2. Check console for errors
3. Use React DevTools extension
4. Monitor network requests

### Backend Debugging

1. Check server logs
2. Use database query tools
3. Test API endpoints with curl/Postman
4. Monitor database connections

### Common Issues

1. **Database Connection Errors**
   - Check environment variables
   - Verify database credentials
   - Test connection with psql

2. **S3 Upload Failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Validate file size and type

3. **API CORS Issues**
   - Check CORS configuration in server.js
   - Verify API base URL in frontend

## Scripts and Tools

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
# Generate dummy firmware data
npm run generate-dummies

# Complete system reset
npm run complete-reset

# Verify system integrity
npm run verify-system
```

## Contributing

### Code Review Process

1. All changes must go through pull request
2. Code must pass linting and type checking
3. New features require documentation updates
4. Database changes require migration scripts

### Documentation Updates

- Update relevant documentation when adding features
- Add API documentation for new endpoints
- Update deployment guide for configuration changes

## Performance Considerations

### Frontend Optimization

- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with dynamic imports
- Use efficient state management

### Backend Optimization

- Implement connection pooling
- Use database indexes effectively
- Cache frequently accessed data
- Optimize database queries

### Database Optimization

- Regular VACUUM and ANALYZE
- Monitor slow queries
- Use appropriate indexes
- Consider query optimization

## Security Best Practices

### Development Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all inputs
- Implement proper error handling

### Production Security

- Use HTTPS for all communications
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities

## Troubleshooting

### Development Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   psql -h your-host -U postgres -d crane_firmware -c "SELECT 1;"
   ```

3. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Getting Help

- Check existing issues in repository
- Review documentation
- Test with minimal reproduction case
- Provide detailed error messages and logs
