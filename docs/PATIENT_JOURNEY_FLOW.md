# Patient Journey Flow - Complete SMS Notification System

## 📋 Overview

This document outlines the complete patient journey through the dental queue management system, including all SMS notifications sent at each stage.

---

## 🔄 Complete Patient Flow

### **Step 1: Patient Books Appointment** 📅
**Location:** Booking Frontend (`http://localhost:5174`)

**What Happens:**
- Patient fills in personal information (name, phone, email)
- Selects appointment date, time, and type
- Submits booking request

**Backend Process:**
- `POST /api/appointments` creates appointment with status `SCHEDULED`
- Appointment stored in database
- **SMS Triggered:** `sendAppointmentConfirmation()`

**SMS Message:**
```
Appointment Confirmed! Your [Appointment Type] appointment is scheduled for [Date] at [Time]. See you then!
```

**Code Location:**
- `backend/src/appointments/appointments.service.ts` (line 58-63)
- `backend/src/sms/sms.service.ts` (line 404-469)

---

### **Step 2: Appointment Appears in Scheduled Appointments** 📋
**Location:** Staff Frontend → Scheduled Appointments Section

**What Happens:**
- Appointment appears in "Scheduled Appointments" section
- Status: `SCHEDULED`
- Shows appointment time, doctor, and patient details
- Staff can view upcoming appointments grouped by date

**No SMS at this stage** - Patient already received booking confirmation

---

### **Step 3: Auto-Add to Waiting Queue** ⏰
**Location:** Background Scheduler (runs every 5 minutes)

**What Happens:**
- Scheduler checks for appointments within next 30 minutes
- Automatically adds eligible appointments to queue
- Updates appointment status: `SCHEDULED` → `CHECKED_IN`
- Creates queue entry with priority `APPOINTMENT`

**Backend Process:**
- `AppointmentSchedulerService.autoAddAppointmentsToQueue()` (runs every 5 min)
- Calls `queueService.checkIn()` with appointment details
- **SMS Triggered:** `sendCheckInConfirmation()`

**SMS Message:**
```
✅ You're now in the queue at [Clinic Name]! You're #X in the queue. Estimated wait time: X minutes. We'll notify you when it's your turn.
```

**Code Location:**
- `backend/src/appointments/appointment-scheduler.service.ts` (line 20-98)
- `backend/src/queue/queue.service.ts` (line 28-125)
- `backend/src/sms/sms.service.ts` (line 205-251)

---

### **Step 4: Patient in Waiting Queue** ⏳
**Location:** Staff Frontend → Waiting Queue

**What Happens:**
- Patient appears in "Waiting Queue" table
- Real-time position and ETA updates via WebSocket
- Priority: `APPOINTMENT` (higher than walk-ins)
- Position updates automatically as queue moves

**Optional SMS (if position changes significantly):**
- Only sent if position changes by 3+ spots
- Rate-limited (max 1 per 5 minutes)
- Message: `Queue Update: You're now #X in line! Estimated wait: ~X minutes. Please stay nearby.`

---

### **Step 5: Patient Called from Waiting Queue** 🔔
**Location:** Staff Frontend → Waiting Queue → "Call Next" button

**What Happens:**
- Staff clicks "Call Next" for patient
- Staff selects available room
- Queue entry status: `WAITING` → `CALLED`
- Room status: `AVAILABLE` → `OCCUPIED`
- **SMS Triggered:** `sendCalledToRoom()`

**SMS Message:**
```
🔔 It's your turn! [Doctor Name] is ready to check you at [Room Name]. Please proceed to the room now.
```

**Code Location:**
- `backend/src/queue/queue.service.ts` (line 227-302)
- `backend/src/sms/sms.service.ts` (line 285-338)

---

### **Step 6: Service Started** 🏥
**Location:** Staff Frontend → In Service

**What Happens:**
- Doctor marks service as started
- Queue entry status: `CALLED` → `IN_SERVICE`
- Service begins

**No SMS at this stage**

---

### **Step 7: Service Completed** ✅
**Location:** Staff Frontend → Complete Service

**What Happens:**
- Doctor marks service as completed
- Queue entry status: `IN_SERVICE` → `COMPLETED`
- Appointment status: `CHECKED_IN` → `COMPLETED` (if applicable)
- Room status: `OCCUPIED` → `AVAILABLE`
- Patient removed from queue
- **SMS Triggered:** `sendServiceCompleted()`

**SMS Message:**
```
✨ Thank you for visiting [Clinic Name]! We hope you had a great experience. Your feedback means a lot to us - please share your thoughts to help us improve our services. We look forward to seeing you again!
```

**Code Location:**
- `backend/src/queue/queue.service.ts` (line 328-376)
- `backend/src/sms/sms.service.ts` (line 359-402)

---

## 📱 SMS Notification Summary

| Stage | Event | SMS Method | Message Type |
|-------|-------|------------|--------------|
| 1. Booking | Appointment Created | `sendAppointmentConfirmation()` | Booking confirmation with date/time |
| 3. Queue Entry | Auto-added to Queue | `sendCheckInConfirmation()` | Queue position and wait time |
| 5. Called | Patient Called to Room | `sendCalledToRoom()` | Room and doctor information |
| 7. Completed | Service Finished | `sendServiceCompleted()` | Thank you and feedback request |

---

## 🔧 Configuration

All SMS features can be controlled via environment variables in `backend/.env`:

```env
# Enable/disable SMS entirely
SMS_ENABLED=true

# Control individual SMS types
SMS_SEND_ON_CHECKIN=true
SMS_SEND_ON_CALLED=true
SMS_SEND_ON_POSITION_CHANGE=true

# Position update threshold (only send if position changes by X spots)
SMS_POSITION_CHANGE_THRESHOLD=3

# Business hours (for non-critical SMS)
SMS_BUSINESS_HOURS_START=08:00
SMS_BUSINESS_HOURS_END=18:00
```

---

## ✅ Verification Checklist

- [x] **Step 1:** SMS sent when appointment is booked
- [x] **Step 3:** SMS sent when patient auto-added to queue from scheduled appointments
- [x] **Step 5:** SMS sent when patient called from waiting queue (includes room & doctor)
- [x] **Step 7:** SMS sent when service completed (includes feedback request)

---

## 🧪 Testing the Flow

### Test Complete Journey:

1. **Book Appointment:**
   ```bash
   # Use booking frontend at http://localhost:5174
   # Or API: POST /api/appointments
   ```

2. **Wait for Auto-Queue (or manually check-in):**
   ```bash
   # Scheduler runs every 5 minutes
   # Or manually: POST /api/queue/check-in
   ```

3. **Call Patient:**
   ```bash
   # Use staff frontend or API: POST /api/queue/{id}/call
   ```

4. **Complete Service:**
   ```bash
   # Use staff frontend or API: POST /api/queue/{id}/complete
   ```

### Check SMS Logs:
```bash
# View backend logs for SMS activity
tail -f logs/backend.log | grep SMS
```

---

## 📊 Flow Diagram

```
┌─────────────────┐
│  Patient Books  │ → SMS: Appointment Confirmed
│   Appointment   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Scheduled     │ (No SMS - already confirmed)
│  Appointments   │
└────────┬────────┘
         │
         ▼ (Auto-add 30 min before)
┌─────────────────┐
│  Waiting Queue  │ → SMS: You're #X in queue, wait time: X min
│   (Checked In)  │
└────────┬────────┘
         │
         ▼ (Staff calls patient)
┌─────────────────┐
│  Called to Room │ → SMS: Dr. [Name] ready at [Room]
│   (Status:      │
│    CALLED)      │
└────────┬────────┘
         │
         ▼ (Service starts)
┌─────────────────┐
│  In Service     │ (No SMS)
│  (Status:       │
│  IN_SERVICE)    │
└────────┬────────┘
         │
         ▼ (Service completed)
┌─────────────────┐
│   Completed     │ → SMS: Thank you + feedback request
│  (Status:       │
│  COMPLETED)     │
└─────────────────┘
```

---

## 🎯 Key Points

1. **All SMS notifications are automatic** - No manual intervention needed
2. **SMS failures don't break the flow** - Queue operations continue even if SMS fails
3. **Rate limiting** - Prevents SMS spam (max 1 per 5 minutes per patient)
4. **Business hours** - Non-critical SMS only sent during business hours (configurable)
5. **Critical SMS always sent** - Called to room and completion SMS sent regardless of business hours

---

## 📝 Notes

- The system uses Twilio for SMS delivery (or mock mode for testing)
- All SMS activity is logged in backend logs
- SMS costs can be tracked via `/api/sms/stats` endpoint
- Patients can opt-out (feature ready, not yet implemented in UI)

---

**Last Updated:** December 2025
**Status:** ✅ All flows implemented and working


