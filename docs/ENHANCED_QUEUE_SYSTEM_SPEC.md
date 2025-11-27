# Enhanced Queue System - Implementation Specification

## Overview

This document outlines the comprehensive queue management system based on the detailed specification provided. This is a **major enhancement** to the existing system.

---

## ✅ Phase 1: COMPLETED

### Database Schema Enhancements

✅ **ServiceType Table**
- Tracks service types with estimated durations
- Links to appointments and queue entries
- Pre-seeded with 8 common service types

✅ **Enhanced Models**
- `Appointment`: Added `serviceTypeId`, `dayBeforeReminder`
- `QueueEntry`: Added `serviceTypeId`, `missedCallCount`
- `QueueStatus`: Added `MISSED_CALL` status

---

## 🚧 Phase 2: IN PROGRESS

### Critical Queue Logic Enhancements

#### 1. **2:1 Ratio Policy** (Priority 3:4 Mix)

**Requirement:**
- After 2 consecutive APPOINTMENT (Priority 3) patients are served
- The system MUST select 1 NORMAL (Priority 4) walk-in patient
- This ensures fair rotation and prevents walk-ins from infinite waiting

**Implementation Plan:**
```typescript
class QueueService {
  private appointmentServeCounter = 0; // Tracks consecutive P3 served
  
  getNextPatient() {
    // Rule: If 2 P3 served, force next P4
    if (this.appointmentServeCounter >= 2) {
      const nextWalkin = findNextPriority4();
      if (nextWalkin) {
        this.appointmentServeCounter = 0;
        return nextWalkin;
      }
    }
    
    // Otherwise: P1 > P2 > P3 > P4
    const next = findHighestPriority();
    if (next.priority === Priority3) {
      this.appointmentServeCounter++;
    } else {
      this.appointmentServeCounter = 0;
    }
    return next;
  }
}
```

#### 2. **Dynamic Priority 2 (Overdue Appointments)**

**Requirement:**
- A Priority 3 appointment that is >10 minutes past scheduled time
- Gets automatically bumped to Priority 2
- Placed between P1 (Emergency) and P3 (On-time Appointments)

**Implementation Plan:**
```typescript
async checkOverdueAppointments() {
  const now = new Date();
  const overdueThreshold = 10; // minutes
  
  const overdueEntries = await prisma.queueEntry.findMany({
    where: {
      priority: QueuePriority.APPOINTMENT,
      status: QueueStatus.WAITING,
      appointment: {
        scheduledTime: {
          lte: new Date(now.getTime() - overdueThreshold * 60 * 1000)
        }
      }
    }
  });
  
  // Update priority to URGENT (Priority 2)
  for (const entry of overdueEntries) {
    await this.bumpToOverduePriority(entry.id);
  }
}
```

#### 3. **5-Minute No-Show Timeout**

**Requirement:**
- When patient status = CALLED
- If no room entry within 5 minutes
- Status → MISSED_CALL
- Patient re-queued at bottom of their priority level
- Next patient automatically called

**Implementation Plan:**
```typescript
@Cron(CronExpression.EVERY_MINUTE)
async checkMissedCalls() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const missedPatients = await prisma.queueEntry.findMany({
    where: {
      status: QueueStatus.CALLED,
      calledAt: { lte: fiveMinutesAgo },
      startedAt: null, // Never entered room
    }
  });
  
  for (const patient of missedPatients) {
    await this.handleMissedCall(patient.id);
  }
}

async handleMissedCall(queueEntryId: string) {
  // 1. Update status to MISSED_CALL
  // 2. Increment missedCallCount
  // 3. Re-add to bottom of priority level
  // 4. Call next patient automatically
  // 5. Send SMS notification
}
```

---

## 📋 Phase 3: PENDING

### Service-Based Wait Time Calculation

**Current:**
```
EWT = (Patients Ahead × Average Time) / Active Rooms
```

**Enhanced:**
```
EWT = Σ(Service Duration[i]) / Active Rooms

Where Service Duration comes from:
1. QueueEntry.serviceType.estimatedDuration
2. Or Appointment.serviceType.estimatedDuration  
3. Or default 30 minutes
```

---

## 📅 Phase 4: PENDING

### Day-Before Reminder System

**Requirement:**
- Send SMS 24 hours before appointment
- Ask patient to confirm or cancel
- Free up slots if cancelled
- Track with `dayBeforeReminder` flag

**Implementation:**
```typescript
@Cron(CronExpression.EVERY_HOUR)
async sendDayBeforeReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledTime: {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      },
      status: AppointmentStatus.SCHEDULED,
      dayBeforeReminder: false,
    }
  });
  
  for (const apt of appointments) {
    await smsService.sendDayBeforeReminder(apt);
    await prisma.appointment.update({
      where: { id: apt.id },
      data: { dayBeforeReminder: true }
    });
  }
}
```

---

## 🎨 Phase 5: PENDING

### Triage Interface for Walk-ins

**Requirement:**
- MANDATORY urgency assessment for all walk-ins
- Interface with clear urgency level selection
- Descriptions for each level

**UI Design:**
```
┌─────────────────────────────────────────┐
│  Walk-in Triage Assessment             │
├─────────────────────────────────────────┤
│                                         │
│  ⚠️  Select Urgency Level (REQUIRED)   │
│                                         │
│  ○ EMERGENCY (Priority 1)              │
│     Severe pain, bleeding, trauma      │
│                                         │
│  ○ URGENT (Priority 2)                 │
│     Acute issue, needs attention today │
│                                         │
│  ○ NORMAL (Priority 4)                 │
│     Routine consultation               │
│                                         │
│  [Continue to Check-In]                │
└─────────────────────────────────────────┘
```

---

## 📊 Current Implementation Status

### ✅ Already Implemented (Current System)

1. **Online Booking** (Port 5174)
   - Service type selection
   - Time slot booking
   - Immediate confirmation SMS

2. **Auto-Queue Scheduler**
   - Adds appointments 30 minutes before scheduled time
   - Runs every 5 minutes
   - SMS notifications

3. **Basic Priority Queue**
   - Emergency > Urgent > Appointment > Normal
   - Redis-based sorting
   - Real-time updates

4. **Reception Dashboard** (Port 5173)
   - Queue management
   - Room assignment
   - Manual check-in

5. **SMS Notifications**
   - Check-in confirmation
   - Called to room (with doctor name)
   - Tilil SMS integration

### 🔨 Needs Implementation

1. **2:1 Ratio Policy** ⭐ CRITICAL
2. **Priority 2 (Overdue)** ⭐ CRITICAL
3. **5-Minute No-Show Timeout** ⭐ CRITICAL
4. **Service-Based EWT Calculation**
5. **Day-Before Reminders**
6. **Mandatory Triage Interface**

---

## 🎯 Implementation Priority

### HIGH PRIORITY (Immediate Impact)
1. ✅ Service Types Database
2. 🚧 2:1 Ratio Queue Logic
3. 🚧 Priority 2 for Overdue
4. 🚧 No-Show Timeout

### MEDIUM PRIORITY (Improves Accuracy)
5. Service-Based EWT
6. Day-Before Reminders

### LOW PRIORITY (UX Enhancement)
7. Triage Interface
8. Enhanced Documentation

---

## 💡 Technical Considerations

### State Management
- Need to persist `appointmentServeCounter` in Redis
- Handle server restarts gracefully
- Sync counter across multiple backend instances

### Performance
- Overdue check should be lightweight (indexed queries)
- No-show check runs every minute (must be fast)
- EWT calculation should cache results

### Edge Cases
1. What if no Priority 4 patients when ratio triggers?
   → Continue with next Priority 3
   
2. What if patient enters room at 4:59 (before timeout)?
   → Status change cancels timeout
   
3. What if all appointments are overdue?
   → They all become Priority 2 (correct behavior)

---

## 📈 Expected Benefits

### For Patients
- ✅ Fair wait times (2:1 ratio prevents walk-in starvation)
- ✅ Accurate ETW (service-type based)
- ✅ Better communication (day-before reminders)

### For Staff
- ✅ Automatic overdue management
- ✅ Auto-handling of no-shows
- ✅ Clear triage workflow

### For Clinic
- ✅ Optimized throughput
- ✅ Reduced no-shows
- ✅ Better resource utilization

---

## 🚀 Next Steps

1. **Complete 2:1 Ratio Logic** (Current phase)
2. **Implement Priority 2 Bumping**
3. **Add No-Show Timeout Scheduler**
4. **Update EWT Calculation**
5. **Test Comprehensive Scenarios**
6. **Deploy with Monitoring**

---

## 📝 Notes

- All changes are backward-compatible
- Existing queue entries will continue to work
- Gradual rollout recommended
- Monitor ratio counter behavior in production
- Service types can be edited via admin panel (future feature)

---

**Last Updated:** Nov 26, 2025
**Version:** 2.0 (Enhanced Queue System)

