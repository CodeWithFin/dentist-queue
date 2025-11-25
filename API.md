# API Documentation

## Overview

Base URL: `http://localhost:3000/api`

All endpoints return JSON responses.

## Authentication

Currently, no authentication is required. For production, implement JWT or OAuth2.

---

## Health Check

### GET /health

Check system health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## Patients API

### POST /patients

Create a new patient.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "notes": "Allergic to penicillin"
}
```

**Response: 201**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /patients

Get all patients with optional filters.

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `status` (optional): Filter by status (ACTIVE, INACTIVE, ARCHIVED)

**Response: 200**
```json
[
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "status": "ACTIVE",
    "_count": {
      "appointments": 5,
      "queueEntries": 3
    }
  }
]
```

### GET /patients/:id

Get patient by ID.

**Response: 200**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "appointments": [...],
  "queueEntries": [...]
}
```

### GET /patients/phone/:phone

Get patient by phone number.

**Response: 200**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "appointments": [...]
}
```

### PUT /patients/:id

Update patient information.

**Request Body:** (All fields optional)
```json
{
  "firstName": "John",
  "email": "newemail@example.com"
}
```

### DELETE /patients/:id

Delete a patient.

**Response: 204 No Content**

---

## Providers API

### POST /providers

Create a new provider (dentist).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@dentist.com",
  "phone": "+1234567890",
  "speciality": "Orthodontics",
  "licenseNo": "DEN123456",
  "isActive": true
}
```

### GET /providers

Get all providers.

### GET /providers/active

Get only active providers.

### GET /providers/:id

Get provider by ID with related data.

### PUT /providers/:id

Update provider information.

### DELETE /providers/:id

Delete a provider.

---

## Appointments API

### POST /appointments

Create a new appointment.

**Request Body:**
```json
{
  "patientId": "uuid",
  "providerId": "uuid",
  "scheduledTime": "2024-01-20T14:00:00Z",
  "duration": 30,
  "reason": "Regular checkup",
  "notes": "First visit",
  "status": "SCHEDULED"
}
```

**Response: 201**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "providerId": "uuid",
  "scheduledTime": "2024-01-20T14:00:00Z",
  "status": "SCHEDULED",
  "patient": {...},
  "provider": {...}
}
```

### GET /appointments

Get all appointments with optional filters.

**Query Parameters:**
- `patientId` (optional)
- `providerId` (optional)
- `status` (optional)
- `date` (optional): YYYY-MM-DD

### GET /appointments/today

Get today's appointments.

**Response: 200**
```json
[
  {
    "id": "uuid",
    "scheduledTime": "2024-01-15T14:00:00Z",
    "status": "SCHEDULED",
    "patient": {...},
    "provider": {...},
    "queueEntry": {...}
  }
]
```

### GET /appointments/:id

Get appointment by ID.

### PUT /appointments/:id

Update appointment.

### PATCH /appointments/:id/status

Update appointment status only.

**Request Body:**
```json
{
  "status": "CHECKED_IN"
}
```

**Status Values:**
- `SCHEDULED`
- `CHECKED_IN`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

### DELETE /appointments/:id

Cancel an appointment.

---

## Rooms API

### POST /rooms

Create a new room.

**Request Body:**
```json
{
  "roomNumber": "R101",
  "name": "Treatment Room 1",
  "status": "AVAILABLE",
  "providerId": "uuid"
}
```

### GET /rooms

Get all rooms.

**Response: 200**
```json
[
  {
    "id": "uuid",
    "roomNumber": "R101",
    "name": "Treatment Room 1",
    "status": "AVAILABLE",
    "provider": {...},
    "_count": {
      "queueEntries": 0
    }
  }
]
```

### GET /rooms/available

Get only available rooms.

### GET /rooms/:id

Get room by ID with queue entries.

### PUT /rooms/:id

Update room information.

### PATCH /rooms/:id/status

Update room status only.

**Request Body:**
```json
{
  "status": "OCCUPIED"
}
```

**Status Values:**
- `AVAILABLE`
- `OCCUPIED`
- `MAINTENANCE`

### DELETE /rooms/:id

Delete a room.

---

## Queue API

### POST /queue/check-in

Check in a patient to the queue.

**Request Body:**
```json
{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "priority": "NORMAL",
  "reason": "Toothache",
  "notes": "Patient arrived early"
}
```

**Priority Values:**
- `EMERGENCY` (Priority 1)
- `URGENT` (Priority 2)
- `APPOINTMENT` (Priority 3)
- `NORMAL` (Priority 4)

**Response: 201**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "priority": "NORMAL",
  "status": "WAITING",
  "queueNumber": 23,
  "position": 5,
  "estimatedWait": 100,
  "checkedInAt": "2024-01-15T10:30:00Z",
  "patient": {...}
}
```

### GET /queue

Get current queue.

**Response: 200**
```json
[
  {
    "id": "uuid",
    "queueNumber": 23,
    "position": 5,
    "status": "WAITING",
    "priority": "NORMAL",
    "estimatedWait": 100,
    "patient": {...},
    "room": null
  }
]
```

### GET /queue/stats

Get queue statistics.

**Response: 200**
```json
{
  "currentQueueSize": 15,
  "todayStats": [
    {
      "status": "COMPLETED",
      "_count": 45
    }
  ],
  "averageWaitTime": 22
}
```

### GET /queue/:id

Get queue entry by ID.

### GET /queue/patient/:patientId/position

Get patient's queue position and ETA.

**Response: 200**
```json
{
  "queueEntry": {...},
  "position": 5,
  "estimatedWait": 100,
  "totalInQueue": 15
}
```

### PATCH /queue/:id/call-next

Call next patient and assign to room.

**Request Body:**
```json
{
  "roomId": "uuid"
}
```

**Response: 200**
```json
{
  "id": "uuid",
  "status": "CALLED",
  "roomId": "uuid",
  "calledAt": "2024-01-15T10:35:00Z",
  "patient": {...},
  "room": {...}
}
```

### PATCH /queue/:id/start-service

Start serving a patient.

**Response: 200**
```json
{
  "id": "uuid",
  "status": "IN_SERVICE",
  "startedAt": "2024-01-15T10:40:00Z"
}
```

### PATCH /queue/:id/complete

Complete patient service.

**Response: 200**
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "completedAt": "2024-01-15T11:00:00Z"
}
```

### PATCH /queue/:id/status

Update queue entry status.

**Request Body:**
```json
{
  "status": "CANCELLED"
}
```

**Status Values:**
- `WAITING`
- `CALLED`
- `IN_SERVICE`
- `COMPLETED`
- `CANCELLED`

### DELETE /queue/:id

Remove patient from queue.

**Response: 204 No Content**

---

## Notifications API

### POST /notifications

Create a notification.

**Request Body:**
```json
{
  "patientId": "uuid",
  "type": "QUEUE_POSITION_CHANGE",
  "title": "Queue Update",
  "message": "Your position is now #3"
}
```

**Notification Types:**
- `QUEUE_POSITION_CHANGE`
- `PATIENT_CALLED`
- `APPOINTMENT_REMINDER`
- `ROOM_READY`
- `SYSTEM_ALERT`

### GET /notifications

Get all notifications with optional filters.

**Query Parameters:**
- `patientId` (optional)
- `unreadOnly` (optional): true/false

### GET /notifications/patient/:patientId

Get notifications for a specific patient.

### PATCH /notifications/:id/read

Mark notification as read.

### PATCH /notifications/patient/:patientId/read-all

Mark all patient notifications as read.

---

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3000/queue');
```

### Client Events (Emit)

#### join-patient-room
```javascript
socket.emit('join-patient-room', { patientId: 'uuid' });
```

#### join-reception-room
```javascript
socket.emit('join-reception-room');
```

#### join-dentist-room
```javascript
socket.emit('join-dentist-room', { providerId: 'uuid' });
```

#### leave-room
```javascript
socket.emit('leave-room', { room: 'patient:uuid' });
```

### Server Events (Listen)

#### queue-updated
Emitted when queue changes.
```javascript
socket.on('queue-updated', (data) => {
  console.log('Queue updated:', data);
});
```

#### position-updated
Emitted when patient position changes.
```javascript
socket.on('position-updated', (data) => {
  console.log('New position:', data);
});
```

#### patient-called
Emitted when patient is called.
```javascript
socket.on('patient-called', (data) => {
  console.log('Patient called:', data);
});
```

#### room-status-changed
Emitted when room status changes.
```javascript
socket.on('room-status-changed', (data) => {
  console.log('Room status:', data);
});
```

#### notification
Emitted for patient notifications.
```javascript
socket.on('notification', (data) => {
  console.log('Notification:', data);
});
```

#### queue-stats
Emitted for queue statistics updates.
```javascript
socket.on('queue-stats', (data) => {
  console.log('Stats:', data);
});
```

#### system-alert
Emitted for system-wide alerts.
```javascript
socket.on('system-alert', (data) => {
  console.log('Alert:', data);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["firstName should not be empty"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Patient with ID uuid not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Patient with this phone already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

For production, implement rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## CORS

Configure allowed origins in backend `.env`:
```env
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

---

## Pagination

For endpoints returning large datasets, implement pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Create a patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'

# Get all patients
curl http://localhost:3000/api/patients

# Check in a patient
curl -X POST http://localhost:3000/api/queue/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "uuid",
    "priority": "NORMAL",
    "reason": "Toothache"
  }'
```

### Using Postman

Import the Swagger documentation:
1. Visit `http://localhost:3000/api/docs`
2. Copy the JSON
3. Import into Postman

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Create patient
const patient = await api.post('/patients', {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
});

// Check in
const queueEntry = await api.post('/queue/check-in', {
  patientId: patient.data.id,
  priority: 'NORMAL',
  reason: 'Regular checkup',
});

// Get position
const position = await api.get(`/queue/patient/${patient.data.id}/position`);
```

### Python

```python
import requests

BASE_URL = 'http://localhost:3000/api'

# Create patient
response = requests.post(f'{BASE_URL}/patients', json={
    'firstName': 'John',
    'lastName': 'Doe',
    'phone': '+1234567890'
})
patient = response.json()

# Check in
response = requests.post(f'{BASE_URL}/queue/check-in', json={
    'patientId': patient['id'],
    'priority': 'NORMAL',
    'reason': 'Regular checkup'
})
queue_entry = response.json()
```

---

## Production Considerations

1. **Authentication**: Implement JWT or OAuth2
2. **Rate Limiting**: Prevent abuse
3. **Validation**: Strict input validation
4. **Logging**: Comprehensive request/response logging
5. **Monitoring**: APM tools (New Relic, DataDog)
6. **Caching**: Redis caching for frequent queries
7. **Documentation**: Keep Swagger docs updated
8. **Versioning**: Use API versioning (/api/v1/)

