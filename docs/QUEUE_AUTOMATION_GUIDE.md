# Queue Automation Guide

## Overview

The Dentist Queue Management System now features **automatic queue management** that intelligently moves scheduled appointments to the queue at the optimal time, ensuring efficient patient flow and minimal wait times.

## How It Works

### Complete Patient Journey

#### 1. **Online Booking** (Patient Portal)
- Patient visits: `http://localhost:5174` (booking frontend)
- Fills in personal information
- Selects date and time slot
- Receives confirmation SMS

**Result:**
- Appointment created with status: `SCHEDULED`
- Appears in "Scheduled Appointments" section
- Not yet in the queue

#### 2. **Scheduled Appointments Section** (Reception Dashboard)
- Reception staff can view all upcoming appointments
- Appointments are grouped by date (Today, Tomorrow, etc.)
- Staff can manually check-in patients early if needed
- Shows appointment time, doctor, and patient details

**Location:** `http://localhost:5173` → Reception Dashboard → "Scheduled Appointments"

#### 3. **Automatic Queue Addition** (Background Scheduler)
- Runs every **5 minutes** automatically
- Checks for appointments within the next **30 minutes**
- Automatically adds eligible appointments to the queue
- Updates status from `SCHEDULED` → `CHECKED_IN`
- Sends SMS notification with queue details

**Timing Example:**
- Appointment scheduled for: **2:00 PM**
- Scheduler runs at: **1:31 PM** (detects appointment is in 29 minutes)
- Action: **Automatically added to queue**
- SMS sent: "Welcome! You're #5 in the queue. Current wait time: 15 minutes."

#### 4. **Waiting Queue**
- Patient appears in "Waiting Queue" table
- Real-time position and ETA updates
- Priority: `APPOINTMENT` (higher priority than normal walk-ins)
- WebSocket updates keep all displays in sync

#### 5. **Called to Room**
- Staff calls next patient from queue
- Selects available room
- Status changes to `CALLED`
- SMS sent: "Dr. [Doctor Name] is ready to see you at [Room Name]"

#### 6. **In Service → Completion**
- Doctor marks service as started
- Status: `IN_SERVICE`
- When done, marked as `COMPLETED`
- Patient history saved

---

## Scheduler Configuration

### Auto-Queue Job
- **Frequency:** Every 5 minutes
- **Trigger:** Appointments within next 30 minutes
- **Priority:** `APPOINTMENT` (medium-high)
- **Duplicate Check:** Prevents re-adding if patient already in queue
- **Status Update:** `SCHEDULED` → `CHECKED_IN`

### Reminder Job
- **Frequency:** Every hour
- **Trigger:** Appointments 1-2 hours away
- **Action:** Send SMS reminder
- **Message:** "Reminder: Your appointment is at [Time] with Dr. [Name]"
- **Tracking:** Marks `reminderSent: true` to prevent duplicates

---

## Time Slot Filtering

### Smart Time Management
- **For TODAY:** Only shows future time slots
  - If current time is 11:00 AM, slots before 11:00 AM are hidden
  - Prevents booking appointments in the past
  
- **For FUTURE DATES:** Shows all slots (9:00 AM - 5:00 PM)
  - Full day availability
  - 30-minute intervals

### Clinic Hours
- **Operating Hours:** 9:00 AM - 5:00 PM
- **Slot Duration:** 30 minutes
- **Closed Days:** Sundays (validated on frontend)

---

## Benefits of Auto-Scheduling

### For Patients
✅ **Less Wait Time** - Only in queue for ~30 minutes before appointment  
✅ **Predictable** - Know exactly when to arrive  
✅ **Real-time Updates** - SMS notifications keep them informed  
✅ **Flexible** - Can book days/weeks in advance  

### For Staff
✅ **Better Visibility** - See all scheduled appointments at a glance  
✅ **Less Manual Work** - No need to manually add appointments to queue  
✅ **Organized Queue** - Appointment patients automatically prioritized  
✅ **Manual Override** - Can still check-in patients early if needed  

### For Clinic Operations
✅ **Efficient Flow** - Queue doesn't get overcrowded hours early  
✅ **Better Planning** - Staff can see appointment load for upcoming days  
✅ **Automated Reminders** - Reduces no-shows  
✅ **Priority Management** - Emergency > Urgent > Appointment > Walk-in  

---

## Testing the Scheduler

### Scenario 1: Book Appointment for Later Today
1. Go to: `http://localhost:5174`
2. Book appointment 35-40 minutes from now
3. Check Reception Dashboard → "Scheduled Appointments"
4. Wait 5-10 minutes
5. Appointment should auto-appear in "Waiting Queue"
6. Patient receives SMS notification

### Scenario 2: Book Appointment for Tomorrow
1. Book appointment for tomorrow at 10:00 AM
2. Today: Appears only in "Scheduled Appointments"
3. Tomorrow at 9:30 AM: Auto-added to queue
4. Patient receives SMS at 9:30 AM
5. Called to room around 10:00 AM

### Scenario 3: Manual Early Check-in
1. Book appointment for 3:00 PM
2. Patient arrives early at 2:00 PM
3. Staff clicks "Check In" button in Scheduled Appointments
4. Immediately added to queue
5. Patient receives SMS

---

## Technical Details

### Backend Implementation
- **File:** `backend/src/appointments/appointment-scheduler.service.ts`
- **Decorator:** `@Cron()` from `@nestjs/schedule`
- **Jobs:** 2 cron jobs (auto-queue, reminders)

### Database Schema
```prisma
model Appointment {
  id             String            @id @default(uuid())
  patientId      String
  providerId     String
  scheduledTime  DateTime
  status         AppointmentStatus @default(SCHEDULED)
  reminderSent   Boolean           @default(false)
  queueEntry     QueueEntry?       @relation("AppointmentQueue")
  // ... other fields
}
```

### Queue Logic
```typescript
// Check if appointment is within 30 minutes
const now = new Date();
const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

const appointmentsToQueue = await prisma.appointment.findMany({
  where: {
    status: AppointmentStatus.SCHEDULED,
    scheduledTime: { gte: now, lte: in30Minutes },
    queueEntry: null,
  },
});
```

---

## Monitoring and Logs

### Check Scheduler Status
```bash
# View backend logs
tail -f backend/logs/app.log

# Look for scheduler messages
grep "auto-add" backend/logs/app.log
grep "AppointmentScheduler" backend/logs/app.log
```

### Log Messages
- `Checking for appointments to auto-add to queue...` (every 5 min)
- `Found X appointment(s) to auto-add to queue`
- `Auto-added appointment [ID] to queue for [Patient Name]`
- `Successfully processed X appointment(s)`

---

## Configuration

### Adjust Scheduler Timing

To change when appointments are added to queue, edit:
**File:** `backend/src/appointments/appointment-scheduler.service.ts`

```typescript
// Current: 30 minutes before
const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

// Change to 1 hour before:
const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000);
```

### Adjust Check Frequency

```typescript
// Current: Every 5 minutes
@Cron(CronExpression.EVERY_5_MINUTES)

// Change to every 10 minutes:
@Cron(CronExpression.EVERY_10_MINUTES)

// Or custom: Every 2 minutes
@Cron('*/2 * * * *')
```

---

## Troubleshooting

### Appointments Not Auto-Adding?

**Check:**
1. Backend server is running: `ps aux | grep "node.*backend"`
2. Scheduler is active: Check logs for "Checking for appointments..."
3. Appointment time is correct: `scheduledTime` must be in UTC
4. Appointment status is `SCHEDULED`
5. Patient not already in queue

**Fix:**
```bash
# Restart backend
npm run dev:backend

# Check logs
tail -f backend/logs/app.log
```

### Manual Force Check

If needed, you can manually trigger the scheduler by calling it directly (for debugging):

```typescript
// In NestJS console or test
await appointmentSchedulerService.autoAddAppointmentsToQueue();
```

---

## Best Practices

1. **Monitor Logs** - Check scheduler logs daily for any errors
2. **Test Regularly** - Create test appointments to verify auto-add works
3. **SMS Balance** - Ensure SMS credits are sufficient for notifications
4. **Time Zones** - All times stored in UTC, displayed in local time
5. **Duplicate Prevention** - Scheduler automatically prevents duplicate queue entries

---

## Summary

The automatic scheduler ensures:
- ✅ All bookings start in "Scheduled" section
- ✅ Auto-move to queue 30 minutes before appointment time
- ✅ Staff can view all scheduled appointments
- ✅ Manual check-in still available for early arrivals
- ✅ SMS notifications sent automatically
- ✅ Efficient queue management without manual intervention

**Result:** Smoother patient flow, better staff experience, and optimal wait times!

