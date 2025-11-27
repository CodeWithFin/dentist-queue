# 📅 Online Appointment Booking - User Guide

## Overview

Your Dentist Queue Management System now includes a **self-service online appointment booking** feature that allows patients to book appointments from anywhere, at any time!

---

## 🌐 Access the Booking Page

**URL:** http://localhost:5173/book

Or click **"Book Appointment"** in the navigation bar of the application.

---

## ✨ Features

### For Patients:
- ✅ **Book from anywhere** - No need to call or visit the clinic
- ✅ **See available time slots** - Real-time availability
- ✅ **Choose appointment type** - Checkup, cleaning, emergency, etc.
- ✅ **Select preferred date** - Up to 2 weeks in advance
- ✅ **Pick convenient time** - 30-minute slots from 9 AM to 5 PM
- ✅ **Instant confirmation** - Get booking details immediately
- ✅ **SMS notifications** - Receive confirmation text (if number verified)
- ✅ **Easy to use** - Simple 3-step process

### For Clinic:
- ✅ **Automated scheduling** - No manual booking needed
- ✅ **Reduced phone calls** - Patients book online
- ✅ **Better planning** - See future appointments
- ✅ **Patient information** - Collect details upfront
- ✅ **SMS confirmations** - Automatic reminders sent

---

## 📝 How to Book an Appointment

### Step 1: Personal Information

Enter your details:
- **First Name** (required)
- **Last Name** (required)
- **Phone Number** (required) - Include country code (e.g., +254746551520)
- **Email** (optional)
- **Date of Birth** (optional)

**Example:**
```
First Name: John
Last Name: Doe
Phone: +254746551520
Email: john.doe@example.com
Date of Birth: 1990-05-15
```

Click **"Next"** to proceed.

---

### Step 2: Select Date & Time

1. **Choose Appointment Type:**
   - Regular Checkup (30 min)
   - Dental Cleaning (45 min)
   - Filling (60 min)
   - Root Canal (90 min)
   - Tooth Extraction (45 min)
   - Consultation (30 min)
   - Emergency (60 min)
   - Other (30 min)

2. **Select Date:**
   - Choose from available dates (next 2 weeks)
   - Sundays are excluded (clinic closed)
   - Shows day and date (e.g., "Monday, November 25, 2025")

3. **Pick Time Slot:**
   - Available slots shown as clickable chips
   - Green = Available, Gray = Already booked
   - Click on your preferred time (9:00 AM - 5:00 PM)
   - Slots are 30 minutes apart

4. **Provide Reason:**
   - Brief description of your dental concern
   - Example: "Tooth pain in upper left molar"

5. **Add Notes (Optional):**
   - Any special requirements
   - Example: "Prefer morning appointments, have dental anxiety"

Click **"Next"** to review.

---

### Step 3: Review & Confirm

Review all your details:
- Patient name and contact info
- Appointment type and duration
- Selected date and time
- Assigned dentist
- Reason and notes

Click **"Confirm Appointment"** to book.

---

### Step 4: Confirmation

✅ **Success!** Your appointment is booked!

You'll see:
- Confirmation ID (save this!)
- All appointment details
- Dentist assigned
- SMS confirmation sent to your phone

**Options:**
- **Book Another Appointment** - Start over for someone else
- **Check In Now** - If you're at the clinic, check in immediately

---

## 📱 SMS Notifications

### Confirmation Message:
```
Appointment Confirmed! Your Regular Checkup appointment is 
scheduled for Nov 25, 2025 at 10:00 AM. See you then!
```

### Note for Trial Accounts:
- Twilio trial accounts can only send SMS to verified numbers
- To verify your number: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Appointment will still be booked even if SMS fails

---

## 🔍 Appointment Types & Duration

| Type | Duration | Best For |
|------|----------|----------|
| Regular Checkup | 30 min | Routine dental check |
| Dental Cleaning | 45 min | Professional cleaning |
| Filling | 60 min | Cavity treatment |
| Root Canal | 90 min | Complex procedure |
| Tooth Extraction | 45 min | Tooth removal |
| Consultation | 30 min | Discuss treatment plans |
| Emergency | 60 min | Urgent dental issues |
| Other | 30 min | Custom appointments |

---

## ⏰ Available Time Slots

**Business Hours:**
- Monday - Saturday: 9:00 AM - 5:00 PM
- Sunday: Closed

**Slot Intervals:** Every 30 minutes
- 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, ... 4:30 PM

**Booking Window:** Up to 14 days in advance

---

## 💡 Tips for Patients

### ✅ Best Practices:
1. **Book early** - Popular slots fill up fast
2. **Provide accurate phone** - Include country code
3. **Be specific** - Clear reason helps dentist prepare
4. **Save confirmation ID** - You'll need it for reference
5. **Arrive 10 min early** - Complete paperwork if needed

### ⚠️ Important Notes:
- **Cancellations:** Contact clinic to cancel/reschedule
- **Emergency:** Call clinic directly for same-day emergencies
- **Wait time:** Booking doesn't guarantee exact start time
- **Changes:** Appointments may be adjusted by clinic staff

---

## 🔧 For Clinic Staff

### Managing Online Bookings:

1. **View Appointments:**
   - Reception Dashboard: http://localhost:5173/reception
   - API: `GET /api/appointments`
   - Filter by date, status, or provider

2. **Today's Appointments:**
   - API: `GET /api/appointments/today`

3. **Update Appointment:**
   - API: `PUT /api/appointments/:id`
   - Change time, provider, or status

4. **Cancel Appointment:**
   - API: `DELETE /api/appointments/:id`
   - Sends cancellation notification

5. **Check Availability:**
   - API: `GET /api/appointments?date=YYYY-MM-DD`
   - Shows all bookings for a specific date

---

## 🔌 API Integration

### Create Appointment:
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "uuid",
    "providerId": "uuid",
    "scheduledTime": "2025-11-25T10:00:00Z",
    "duration": 30,
    "reason": "Regular checkup",
    "notes": "First visit",
    "status": "SCHEDULED"
  }'
```

### Get Available Slots:
```bash
# Get all appointments for a date
curl "http://localhost:3000/api/appointments?date=2025-11-25"

# Check availability (client-side logic compares with all slots)
```

### Check Today's Schedule:
```bash
curl http://localhost:3000/api/appointments/today
```

---

## 🎨 Customization

### Modify Appointment Types:

Edit: `frontend/src/pages/AppointmentBookingPage.tsx`

```typescript
const appointmentTypes = [
  { value: 'checkup', label: 'Regular Checkup', duration: 30 },
  { value: 'cleaning', label: 'Dental Cleaning', duration: 45 },
  // Add or modify types here
];
```

### Change Business Hours:

Edit: `frontend/src/pages/AppointmentBookingPage.tsx`

```typescript
// In loadTimeSlots function
for (let hour = 9; hour < 17; hour++) {  // 9 AM to 5 PM
  // Change hour range here
}
```

### Modify Booking Window:

```typescript
// In generateAvailableDates function
for (let i = 0; i < 14; i++) {  // 14 days ahead
  // Change number of days here
}
```

### Exclude Days:

```typescript
// In generateAvailableDates function
if (dayOfWeek !== 0) {  // Skip Sundays
  // Modify condition to skip other days
  // 0=Sunday, 1=Monday, ..., 6=Saturday
}
```

---

## 📊 Statistics & Monitoring

### View Booking Stats:
```bash
# Total appointments
curl http://localhost:3000/api/appointments | jq 'length'

# Appointments by status
curl "http://localhost:3000/api/appointments?status=SCHEDULED" | jq 'length'

# Today's bookings
curl http://localhost:3000/api/appointments/today | jq 'length'

# Appointments by provider
curl "http://localhost:3000/api/appointments?providerId=PROVIDER_ID"
```

---

## 🐛 Troubleshooting

### Issue: "Failed to load providers"
**Solution:** 
1. Check if backend is running: `curl http://localhost:3000/api/health`
2. Create providers: `curl -X POST http://localhost:3000/api/providers -H "Content-Type: application/json" -d '{"name":"Dr. Smith","specialization":"General Dentistry","email":"smith@clinic.com","phone":"+1234567890"}'`

### Issue: "Failed to load time slots"
**Solution:**
1. Check date format (YYYY-MM-DD)
2. Ensure backend appointments API is working
3. Check browser console for errors

### Issue: "Patient already exists"
**Solution:**
- System will automatically find existing patient by phone number
- Appointment will still be created successfully

### Issue: "No available time slots"
**Solution:**
1. Try different date (might be fully booked)
2. Check if providers exist in system
3. Verify business hours configuration

### Issue: SMS not received
**Solution:**
- Verify phone number in Twilio Console (trial accounts)
- Check SMS service status: `curl http://localhost:3000/api/sms/stats`
- Appointment is still booked even if SMS fails

---

## 🔐 Security Considerations

### Current Implementation:
- ✅ Input validation on frontend and backend
- ✅ Phone number format validation
- ✅ Email format validation
- ✅ Date/time validation
- ⚠️ No authentication required (public booking)

### Recommended Enhancements:
- Add CAPTCHA to prevent spam bookings
- Implement rate limiting (max bookings per IP)
- Add email verification for confirmations
- Require authentication for cancellations
- Add booking conflict prevention at database level

---

## 🚀 Future Enhancements

### Potential Features:
1. **Email Confirmations** - Send detailed email with calendar invite
2. **Appointment Reminders** - SMS/Email 24 hours before appointment
3. **Online Cancellation** - Let patients cancel/reschedule online
4. **Provider Profiles** - Show dentist photos and bios
5. **Patient History** - Show past appointments for returning patients
6. **Payment Integration** - Require deposit for bookings
7. **Waitlist** - Join waitlist if preferred time is full
8. **Multi-location** - Support multiple clinic locations
9. **Insurance Info** - Collect insurance details upfront
10. **Follow-up Scheduling** - Book next appointment after visit

---

## 📞 Support

### For Patients:
- **Booking Issues:** Contact clinic at +1234567890
- **Technical Problems:** Email: support@clinic.com
- **Emergencies:** Call clinic immediately

### For Clinic Staff:
- **Backend API:** http://localhost:3000/api/docs (Swagger)
- **Frontend:** http://localhost:5173/book
- **Logs:** `tail -f backend.log`

---

## 🎯 Quick Reference

### Patient Flow:
```
1. Visit http://localhost:5173/book
2. Enter personal info → Next
3. Select type, date, time → Next
4. Review details → Confirm
5. Receive confirmation → Done!
```

### Staff Flow:
```
1. Patient books online
2. Appointment created in system
3. SMS sent to patient (if verified)
4. View in reception dashboard
5. Check in patient when they arrive
6. Add to queue → Call to room
```

### API Endpoints:
- `POST /api/appointments` - Create booking
- `GET /api/appointments` - List all
- `GET /api/appointments/today` - Today's schedule
- `GET /api/appointments/:id` - Get specific
- `PUT /api/appointments/:id` - Update
- `DELETE /api/appointments/:id` - Cancel
- `GET /api/providers` - List dentists

---

## ✅ Testing the Booking System

### Test Scenario 1: New Patient Books Appointment
```bash
# 1. Open booking page
http://localhost:5173/book

# 2. Enter test data:
First Name: Test
Last Name: Patient
Phone: +254746551520  # Your verified number
Email: test@example.com

# 3. Select:
Type: Regular Checkup
Date: Tomorrow
Time: 10:00 AM
Reason: Test booking

# 4. Confirm and verify:
- Confirmation ID received
- SMS received (if number verified)
- Appointment visible in reception dashboard
```

### Test Scenario 2: API Direct Booking
```bash
# Create provider first
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "specialization": "General",
    "email": "test@clinic.com",
    "phone": "+1234567890"
  }'

# Create patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254746551520",
    "email": "john@example.com",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "address": "123 Main St"
  }'

# Book appointment (use returned IDs)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_UUID",
    "providerId": "PROVIDER_UUID",
    "scheduledTime": "2025-11-25T10:00:00Z",
    "duration": 30,
    "reason": "Regular checkup",
    "status": "SCHEDULED"
  }'
```

---

## 📋 Summary

**What's New:**
✅ Self-service online booking page
✅ 3-step booking process
✅ Real-time availability checking
✅ Multiple appointment types
✅ SMS confirmations
✅ Automatic patient creation
✅ Provider assignment
✅ Instant confirmation

**Access:**
🌐 http://localhost:5173/book

**Benefits:**
- 24/7 booking availability
- Reduced phone calls
- Better patient experience
- Automated confirmations
- Improved scheduling efficiency

---

**Date:** November 24, 2025  
**Feature:** Online Appointment Booking  
**Status:** ✅ Active & Ready to Use

