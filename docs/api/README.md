# API Documentation

## Overview

CraneEyes Firmware Manager provides a RESTful API for managing firmware files, models, and activity logs.

**Base URL:** `http://localhost:3001/api`

## Authentication

Currently uses simple session-based authentication. Admin routes require authentication.

## Endpoints

### Health Check

#### GET `/health`
Check API server status.

**Response:**
```json
{
  "status": "OK",
  "message": "CraneEyes API Server is running"
}
```

### Models

#### GET `/models`
Get all crane models.

**Response:**
```json
[
  {
    "id": 1,
    "name": "SS1416",
    "category": "Stick Crane",
    "subCategory": "5T",
    "firmwareCount": 1
  }
]
```

#### POST `/models`
Create a new model.

**Request Body:**
```json
{
  "name": "New Model",
  "category": "Stick Crane",
  "subCategory": "5T",
  "firmwareCount": 0
}
```

### Firmwares

#### GET `/firmwares`
Get all firmware files with model information.

**Response:**
```json
[
  {
    "id": 49,
    "modelId": 2,
    "modelName": "SS1406",
    "version": "3.1.1",
    "releaseDate": "2025-10-19T15:00:00.000Z",
    "size": "2.2 MB",
    "downloads": 0,
    "s3Key": "firmwares/SS1406/3.1.1/firmware.pdf",
    "description": "Firmware description"
  }
]
```

#### POST `/firmwares`
Upload a new firmware file.

**Request Body:**
```json
{
  "modelId": 2,
  "version": "1.0.0",
  "releaseDate": "2025-01-20",
  "size": "2.5 MB",
  "downloads": 0,
  "s3Key": "firmwares/SS1406/1.0.0/firmware.bin",
  "description": "Initial release"
}
```

#### PUT `/firmwares/:id`
Update firmware information.

**Request Body:**
```json
{
  "version": "1.1.0",
  "description": "Updated description"
}
```

#### DELETE `/firmwares/:id`
Delete a firmware file.

#### POST `/firmwares/:id/download`
Increment download count for a firmware.

### Logs

#### GET `/logs`
Get activity logs.

**Response:**
```json
[
  {
    "id": 1,
    "type": "download",
    "user": "crane@dy.co.kr",
    "model": "SS1406",
    "version": "1.0.0",
    "ip": "127.0.0.1",
    "timestamp": "2025-01-20T10:00:00.000Z"
  }
]
```

#### POST `/logs`
Create a new log entry.

**Request Body:**
```json
{
  "type": "upload",
  "user": "crane@dy.co.kr",
  "model": "SS1406",
  "version": "1.0.0",
  "ip": "127.0.0.1",
  "timestamp": "2025-01-20T10:00:00"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

Currently no rate limiting implemented. Consider implementing for production use.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.
