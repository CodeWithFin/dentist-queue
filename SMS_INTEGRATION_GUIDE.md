# SMS Notification Integration Guide

## Overview

This guide shows you how to add SMS notifications to your Dentist Queue Management System using Twilio.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Twilio Account

1. Sign up at https://www.twilio.com/try-twilio
2. Get your **free trial credits** ($15 credit)
3. Note your credentials:
   - Account SID
   - Auth Token
   - Phone Number

### Step 2: Install Twilio SDK

```bash
cd /home/finley/siscom/sidequest/dentist-queue-management-system/backend
npm install twilio
```

### Step 3: Add to Environment Variables

```bash
# Edit backend/.env
nano backend/.env

# Add these lines:
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
SMS_ENABLED=true
```

### Step 4: Apply the Code Changes

I'll create the SMS service and integrate it!

---

## 📱 SMS Notification Scenarios

### 1. Check-In Confirmation
**When:** Patient completes check-in  
**Message:**
```
Welcome to [Clinic Name]! 
You're #23 in queue, position 5.
Estimated wait: ~20 minutes.
We'll text you when it's your turn!
```

### 2. Position Update (Significant Change)
**When:** Position changes by 3+ spots OR 5+ minute ETA change  
**Message:**
```
Queue Update: You're now #4 in line!
Estimated wait: ~8 minutes.
Please stay nearby.
```

### 3. Called to Room
**When:** Reception calls patient  
**Message:**
```
🔔 You're being called!
Please proceed to Treatment Room 2.
```

### 4. Almost Your Turn
**When:** Position is 2 or less  
**Message:**
```
⏰ Almost your turn!
You're #2 in line. Please return to waiting area.
```

### 5. Appointment Reminder (Day Before)
**When:** Scheduled at 2 AM for next-day appointments  
**Message:**
```
Reminder: Your dental appointment is tomorrow at 2:00 PM.
Reply CONFIRM or call us at (555) 123-4567.
```

---

## 🛠️ Implementation Files

I'll create these files for you:

### Files to be Created:
1. `backend/src/sms/sms.module.ts` - SMS module
2. `backend/src/sms/sms.service.ts` - SMS service with Twilio
3. `backend/src/sms/dto/send-sms.dto.ts` - Data transfer objects
4. Update `backend/src/queue/queue.service.ts` - Add SMS triggers
5. Update `backend/src/app.module.ts` - Import SMS module

---

## 📋 SMS Service Features

### Core Features:
- ✅ Send SMS via Twilio
- ✅ Template-based messages
- ✅ Queue position notifications
- ✅ Called to room alerts
- ✅ Appointment reminders
- ✅ Delivery status tracking
- ✅ Rate limiting (avoid spam)
- ✅ Cost tracking
- ✅ Opt-out handling

### Smart Notification Logic:
- Only send updates for significant changes
- Don't spam (max 1 SMS per 5 minutes per patient)
- Only send during business hours (configurable)
- Skip if patient opted out
- Log all SMS for audit

---

## 💰 Cost Estimation

### Twilio Pricing (USD):
- **SMS in US**: $0.0075 per message
- **SMS International**: $0.0075 - $0.50 per message
- **Phone Number**: $1.15/month

### Example Costs:
- **100 patients/day** × 3 SMS each = 300 SMS/day
- **300 × $0.0075** = $2.25/day = **$67.50/month**
- **Plus phone number**: $1.15/month
- **Total**: ~$68.65/month

With **$15 trial credit** = ~2,000 free SMS to test!

---

## ⚙️ Configuration Options

### Environment Variables:

```env
# SMS Provider
SMS_ENABLED=true
SMS_PROVIDER=twilio

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# SMS Behavior
SMS_SEND_ON_CHECKIN=true
SMS_SEND_ON_POSITION_CHANGE=true
SMS_SEND_ON_CALLED=true
SMS_SEND_APPOINTMENT_REMINDER=true

# Business Hours (24h format)
SMS_BUSINESS_HOURS_START=08:00
SMS_BUSINESS_HOURS_END=18:00

# Rate Limiting
SMS_MIN_INTERVAL_MINUTES=5
SMS_POSITION_CHANGE_THRESHOLD=3

# Message Customization
SMS_CLINIC_NAME="Your Dental Clinic"
SMS_CLINIC_PHONE="+15551234567"
```

---

## 🎨 Message Templates

### Customizable Templates:

```typescript
// backend/src/sms/templates/sms.templates.ts

export const SMS_TEMPLATES = {
  CHECK_IN_CONFIRMATION: (data) => 
    `Welcome to ${data.clinicName}! You're #${data.queueNumber} in queue, position ${data.position}. Estimated wait: ~${data.eta} minutes. We'll text you when it's your turn!`,
  
  POSITION_UPDATE: (data) => 
    `Queue Update: You're now #${data.position} in line! Estimated wait: ~${data.eta} minutes. Please stay nearby.`,
  
  CALLED_TO_ROOM: (data) => 
    `🔔 You're being called! Please proceed to ${data.roomName}.`,
  
  ALMOST_YOUR_TURN: (data) => 
    `⏰ Almost your turn! You're #${data.position} in line. Please return to waiting area.`,
  
  APPOINTMENT_REMINDER: (data) => 
    `Reminder: Your dental appointment is ${data.when} at ${data.time}. Reply CONFIRM or call us at ${data.clinicPhone}.`,
  
  APPOINTMENT_CONFIRMED: (data) => 
    `Your appointment on ${data.date} at ${data.time} is confirmed. See you then!`,
  
  RUNNING_LATE: (data) => 
    `We're running about ${data.minutes} minutes behind schedule. Thank you for your patience!`,
};
```

---

## 📊 SMS Dashboard & Analytics

### Track SMS Usage:

```typescript
// View SMS statistics
GET /api/sms/stats

Response:
{
  "today": {
    "sent": 45,
    "delivered": 43,
    "failed": 2,
    "cost": 0.3375
  },
  "thisMonth": {
    "sent": 892,
    "delivered": 878,
    "failed": 14,
    "cost": 6.69
  }
}
```

---

## 🔒 Privacy & Compliance

### Important Considerations:

1. **Opt-In Required**: Get patient consent before sending SMS
2. **Opt-Out Mechanism**: Honor STOP/UNSUBSCRIBE requests
3. **HIPAA Compliance**: Don't include sensitive medical info
4. **Data Retention**: Log SMS for audit purposes
5. **Business Hours**: Only send during appropriate times

### Sample Opt-In Form:

```typescript
// Add to patient registration
{
  "smsNotifications": true,
  "smsConsent": "I agree to receive SMS notifications about my appointments and queue status",
  "consentDate": "2024-01-15T10:00:00Z"
}
```

---

## 🧪 Testing SMS

### Test in Development:

```bash
# Option 1: Use Twilio Test Credentials (no real SMS)
TWILIO_ACCOUNT_SID=ACtest123
TWILIO_AUTH_TOKEN=test_token
TWILIO_PHONE_NUMBER=+15005550006

# Option 2: Use Trial Account (sends to verified numbers only)
# Add test numbers in Twilio Console → Phone Numbers → Verified Numbers

# Option 3: Mock SMS Service (no Twilio calls)
SMS_ENABLED=false
SMS_MOCK_MODE=true
```

### Test Endpoints:

```bash
# Send test SMS
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "message": "Test message from Dentist Queue System"
  }'

# Check SMS delivery status
curl http://localhost:3000/api/sms/status/SMxxxxxxxxxxxx
```

---

## 📱 Alternative SMS Providers

If you prefer other services:

### AWS SNS
```bash
npm install @aws-sdk/client-sns
# Configure AWS credentials
```

### Vonage (Nexmo)
```bash
npm install @vonage/server-sdk
# Configure Vonage API credentials
```

### MessageBird
```bash
npm install messagebird
# Configure MessageBird API key
```

---

## 🚦 Implementation Checklist

- [ ] Sign up for Twilio account
- [ ] Get API credentials
- [ ] Install Twilio package
- [ ] Add environment variables
- [ ] Apply code changes (I'll create them)
- [ ] Test with your phone number
- [ ] Verify delivery
- [ ] Add opt-in to patient registration
- [ ] Configure message templates
- [ ] Set up monitoring
- [ ] Go live!

---

## 📞 Twilio Setup Steps (Detailed)

### 1. Sign Up for Twilio

```
1. Go to: https://www.twilio.com/try-twilio
2. Sign up with email
3. Verify your email and phone
4. Get $15 free trial credit!
```

### 2. Get Your Credentials

```
1. Log in to Twilio Console
2. Go to Dashboard
3. Copy these values:
   - Account SID (starts with AC)
   - Auth Token (click to reveal)
```

### 3. Get a Phone Number

```
1. In Twilio Console, go to:
   Phone Numbers → Manage → Buy a number
2. Choose country (US recommended)
3. Search for available numbers
4. Buy a number ($1.15/month, included in trial)
5. Copy your new phone number
```

### 4. Configure SMS Capabilities

```
1. Go to: Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Under "Messaging":
   - Configure with: Webhooks, TwiML Bins, Functions, etc.
   - A message comes in: Leave default or configure webhook
4. Save
```

---

## 🎯 Next Steps

1. **Sign up for Twilio** (5 minutes)
2. **Get credentials** (2 minutes)
3. **Install & configure** (3 minutes)
4. **Apply code changes** (I'll provide these)
5. **Test with your phone** (2 minutes)
6. **Deploy & use!** 🎉

---

## 💡 Pro Tips

### Optimize Costs:
- Only send important updates
- Use position threshold (don't send for every position change)
- Rate limit (max 1 SMS per 5 minutes)
- Send reminders only once

### Improve Delivery:
- Use short, clear messages
- Include clinic name
- Add opt-out instructions
- Test with different carriers

### Better UX:
- Let patients reply CONFIRM/CANCEL
- Two-way SMS conversation
- Custom message per priority level
- Send ETA updates

---

## 📚 Resources

- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Twilio Node.js Guide**: https://www.twilio.com/docs/libraries/node
- **Pricing**: https://www.twilio.com/sms/pricing
- **Console**: https://console.twilio.com/

---

## 🆘 Troubleshooting

### SMS Not Sending?
```bash
# Check logs
tail -f backend.log | grep SMS

# Verify credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN

# Test Twilio connection
curl -X GET "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

### Trial Limitations?
- Can only send to verified numbers
- Add numbers in: Console → Phone Numbers → Verified Caller IDs

### Message Blocked?
- Check Twilio logs in Console
- Verify phone number format (+1XXXXXXXXXX)
- Check spam filters

---

**Ready to add SMS notifications? Let me create the code for you!** 🚀

