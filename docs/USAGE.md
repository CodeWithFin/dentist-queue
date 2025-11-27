# User Guide - Dentist Queue Management System

## Table of Contents
- [Overview](#overview)
- [Patient Check-In](#patient-check-in)
- [Patient Queue Status](#patient-queue-status)
- [Reception Dashboard](#reception-dashboard)
- [Dentist Dashboard](#dentist-dashboard)
- [Public Waiting Screen](#public-waiting-screen)
- [Priority Levels](#priority-levels)
- [API Usage](#api-usage)

## Overview

The Dentist Queue Management System helps dental clinics efficiently manage patient queues with real-time updates, priority handling, and multi-dashboard support.

### Key Features

- ✅ Patient self-check-in
- ✅ Real-time queue position tracking
- ✅ Priority-based queueing
- ✅ Multiple dashboards (Patient, Reception, Dentist)
- ✅ WebSocket real-time updates
- ✅ Room management
- ✅ Public waiting display

## Patient Check-In

### Accessing Check-In

Navigate to: `http://localhost:5173/check-in`

### Check-In Process

#### Step 1: Phone Number Entry
1. Enter your phone number
2. Click "Continue"

#### Step 2: Registration (New Patients Only)
If you're a new patient:
1. Fill in your details:
   - First Name (required)
   - Last Name (required)
   - Email (optional)
   - Phone (auto-filled)
2. Click "Register & Continue"

#### Step 3: Visit Details
1. Select priority level:
   - 🚨 **Emergency**: Immediate attention required
   - ⚠️ **Urgent**: Needs quick attention
   - 📅 **Appointment**: Scheduled appointment
   - 👤 **Normal Walk-in**: Regular visit

2. Enter reason for visit (required)
3. Add any additional notes (optional)
4. Click "Complete Check-In"

#### Step 4: Confirmation
- You'll receive a queue number
- You'll be redirected to your queue status page
- Save the URL to check your status later

### Example Flow

```
Enter Phone: +1234567890
→ New Patient Registration
→ Select Priority: Normal
→ Reason: Regular checkup
→ Queue Number: #23
→ Position: 5th in line
→ Estimated Wait: ~20 minutes
```

## Patient Queue Status

### Accessing Your Status

Navigate to: `http://localhost:5173/patient/{patientId}`

### Information Displayed

1. **Queue Number**: Your unique number for today
2. **Position**: Your current position in the queue
3. **Estimated Wait**: Approximate wait time in minutes
4. **Status**: Current status (Waiting, Called, In Service)
5. **Visit Details**: Your reason and notes

### Status Updates

The page automatically updates in real-time:
- Position changes as patients are served
- Notifications when you're called
- Room assignment when ready

### Notifications

You'll receive alerts for:
- Position changes
- When you're being called
- Room assignment
- Important updates

## Reception Dashboard

### Accessing Dashboard

Navigate to: `http://localhost:5173/reception`

### Dashboard Overview

#### Statistics Cards
- **In Queue**: Total patients currently in queue
- **Waiting**: Patients waiting to be called
- **In Progress**: Patients being served
- **Avg Wait Time**: Average waiting time today

#### Waiting Queue Table

Displays all waiting patients with:
- Queue number
- Position
- Patient name
- Priority level
- Reason for visit
- Estimated wait time
- Actions (Call, Remove)

#### In Progress Table

Shows patients currently being served:
- Queue number
- Patient name
- Room assigned
- Current status
- Actions (Start Service, Complete)

### Managing the Queue

#### Calling a Patient

1. Find the patient in the Waiting Queue
2. Click "Call" button
3. Select an available room
4. Click "Confirm"
5. Patient will be notified

#### Starting Service

1. Find the patient in In Progress (status: CALLED)
2. Click "Start Service"
3. Status changes to IN_SERVICE
4. Room marked as OCCUPIED

#### Completing Service

1. Find the patient in In Progress (status: IN_SERVICE)
2. Click "Complete"
3. Patient removed from queue
4. Room marked as AVAILABLE

#### Removing from Queue

1. Find the patient in Waiting Queue
2. Click "Remove"
3. Confirm action
4. Patient removed from queue

### Best Practices

1. **Priority Order**: Call emergency patients first
2. **Room Assignment**: Assign rooms based on provider availability
3. **Regular Updates**: Refresh if real-time updates fail
4. **Clear Communication**: Use the notes field for special instructions

## Dentist Dashboard

### Accessing Dashboard

Navigate to: `http://localhost:5173/dentist`

### Dashboard Sections

#### My Patients

Shows patients currently assigned to you:
- Queue number
- Patient name
- Current status
- Room assigned
- Visit details
- Complete button

#### Waiting Queue

Preview of patients waiting:
- Next 10 patients in queue
- Priority levels
- Reason for visit
- Useful for planning

#### Room Management

Control room status:
- **Available**: Ready for next patient
- **Occupied**: Currently in use
- **Maintenance**: Under maintenance

### Managing Patients

#### Completing a Visit

1. Find patient in "My Patients"
2. Ensure treatment is complete
3. Click "Complete" button
4. Patient exits the queue
5. Room becomes available

#### Room Status Updates

1. Find the room in Room Management
2. Click status button:
   - "Free" - Mark as available
   - "Occupied" - Mark as in use
3. Status updates across all dashboards

### Tips for Dentists

1. **Check Queue**: Review waiting queue between patients
2. **Update Rooms**: Mark rooms free promptly
3. **Monitor Status**: Keep dashboard open for real-time updates
4. **Communicate**: Add notes for reception staff

## Public Waiting Screen

### Accessing Display

Navigate to: `http://localhost:5173/display`

### Display Features

#### Now Serving Section
- Large display of currently called patients
- Shows queue numbers
- Displays assigned rooms
- Color-coded for visibility

#### Waiting Queue Table
- All patients currently waiting
- Queue number
- Position
- Priority level
- Estimated wait time

### Display Setup

Ideal for:
- Waiting room TV/monitor
- Public information displays
- Kiosk displays

### Auto-Refresh

- Updates automatically every 3 seconds
- Real-time WebSocket updates
- No user interaction required

## Priority Levels

### Understanding Priorities

#### 🚨 Emergency (Priority 1)
- **When to Use**: Severe pain, trauma, bleeding
- **Queue Position**: Always first
- **Example**: Broken tooth, severe infection

#### ⚠️ Urgent (Priority 2)
- **When to Use**: Significant discomfort, needs quick attention
- **Queue Position**: After emergencies
- **Example**: Lost filling, moderate pain

#### 📅 Appointment (Priority 3)
- **When to Use**: Scheduled appointments
- **Queue Position**: Before walk-ins
- **Example**: Regular checkup, follow-up

#### 👤 Normal (Priority 4)
- **When to Use**: Non-urgent walk-ins
- **Queue Position**: Last
- **Example**: Consultation, routine cleaning

### Priority Queue Logic

```
Emergency → Urgent → Appointment → Normal
    ↓          ↓          ↓          ↓
  (Within each level, first-come-first-served)
```

## API Usage

### Authentication

Currently, the system doesn't require authentication. For production, implement JWT or OAuth.

### Base URL

```
http://localhost:3000/api
```

### Common Endpoints

#### Check In a Patient

```bash
POST /api/queue/check-in
Content-Type: application/json

{
  "patientId": "uuid",
  "priority": "NORMAL",
  "reason": "Regular checkup",
  "notes": "First visit"
}
```

#### Get Current Queue

```bash
GET /api/queue
```

#### Get Patient Position

```bash
GET /api/queue/patient/{patientId}/position
```

#### Get Queue Statistics

```bash
GET /api/queue/stats
```

### WebSocket Events

#### Connect to WebSocket

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/queue');
```

#### Join Patient Room

```javascript
socket.emit('join-patient-room', { patientId: 'uuid' });
```

#### Listen for Position Updates

```javascript
socket.on('position-updated', (data) => {
  console.log('New position:', data);
});
```

#### Listen for Call Notifications

```javascript
socket.on('patient-called', (data) => {
  console.log('You are being called!', data);
});
```

### API Documentation

Full API documentation available at:
```
http://localhost:3000/api/docs
```

## Troubleshooting

### Common Issues

#### Can't Check In
- Verify phone number format (+1234567890)
- Check network connection
- Try refreshing the page

#### Queue Position Not Updating
- Check WebSocket connection
- Refresh the page
- Verify backend is running

#### Not Receiving Notifications
- Enable browser notifications
- Check notification permissions
- Verify WebSocket connection

### Getting Help

1. Check system status: `GET /api/health`
2. Review browser console for errors
3. Contact reception desk
4. Check deployment logs

## Best Practices

### For Patients
1. Check in early
2. Keep the status page open
3. Stay near the waiting area
4. Update your information regularly

### For Reception Staff
1. Monitor the queue continuously
2. Call patients in priority order
3. Communicate delays to waiting patients
4. Keep room assignments updated

### For Dentists
1. Update room status promptly
2. Review waiting queue between patients
3. Communicate special needs to reception
4. Complete visits promptly in the system

## Tips & Tricks

### Keyboard Shortcuts
- `Ctrl/Cmd + R`: Refresh dashboard
- `F11`: Full screen (useful for public display)

### Mobile Usage
- All dashboards are mobile-responsive
- Patients can check status on their phones
- Save the status URL for later access

### Performance
- System handles 100+ concurrent users
- Real-time updates typically < 1 second
- Average check-in time: ~2 minutes

## Support

For technical support:
- Email: support@example.com
- Phone: +1-234-567-8900
- Hours: 24/7

For system issues:
- Check logs: `docker-compose logs`
- Restart services: `docker-compose restart`
- Contact IT administrator

