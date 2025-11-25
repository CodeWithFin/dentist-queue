# 📱 SMS Quick Setup - 5 Minutes

## ✅ What's Already Done

I've integrated SMS functionality into your system! Here's what's ready:

- ✅ SMS Service module created
- ✅ Twilio integration code
- ✅ SMS triggers in queue system
- ✅ Environment variables configured
- ✅ SMS controller with API endpoints
- ✅ Mock mode enabled (test without Twilio account)

---

## 🚀 Step-by-Step Setup

### Option A: Test in Mock Mode (Instant)

Your system is **already configured** in mock mode! SMS notifications will log to console instead of sending real texts.

**Test it now:**
```bash
# Backend will log:
tail -f /home/finley/siscom/sidequest/dentist-queue-management-system/backend.log | grep SMS
```

Try checking in a patient - you'll see mock SMS in the logs!

---

### Option B: Enable Real SMS with Twilio (5 minutes)

#### Step 1: Get Twilio Account (2 min)
```
1. Visit: https://www.twilio.com/try-twilio
2. Sign up (free $15 credit!)
3. Verify phone & email
4. Note these credentials:
   - Account SID (starts with AC)
   - Auth Token (click to reveal)
```

#### Step 2: Get Phone Number (1 min)
```
1. Twilio Console → Phone Numbers → Buy a Number
2. Choose US number ($0 with trial!)
3. Buy number
4. Copy phone number (format: +15551234567)
```

#### Step 3: Update Configuration (1 min)
```bash
# Edit backend/.env
nano /home/finley/siscom/sidequest/dentist-queue-management-system/backend/.env

# Update these lines:
SMS_ENABLED=true
SMS_MOCK_MODE=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_actual_auth_token
TWILIO_PHONE_NUMBER=+15551234567
SMS_CLINIC_NAME=My Dental Clinic

# Save and exit (Ctrl+X, Y, Enter)
```

#### Step 4: Install Twilio & Restart (1 min)
```bash
cd /home/finley/siscom/sidequest/dentist-queue-management-system/backend
npm install twilio

# Backend will auto-reload!
```

#### Step 5: Test SMS (30 sec)
```bash
# Send test SMS to YOUR phone
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "message": "Test from Dentist Queue System!"
  }'
```

✅ **Done!** You should receive a text message!

---

## 📱 SMS Triggers

SMS will automatically send when:

### 1. Patient Checks In ✅
```
"Welcome to My Dental Clinic! 
You're #23 in queue, position 5. 
Estimated wait: ~20 minutes.
We'll text you when it's your turn!"
```

### 2. Patient Called to Room ✅
```
"🔔 You're being called! 
Please proceed to Treatment Room 2."
```

### 3. Position Update (if > 3 spots) ✅
```
"Queue Update: You're now #2 in line! 
Estimated wait: ~4 minutes. 
Please stay nearby."
```

---

## 🧪 Testing Your SMS

### Test Endpoints:

```bash
# 1. Send test SMS
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"to":"+15551234567","message":"Hello!"}'

# 2. Check SMS stats
curl http://localhost:3000/api/sms/stats

# 3. Check-in a patient (triggers SMS)
curl -X POST http://localhost:3000/api/queue/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "patientId":"patient_id_here",
    "priority":"NORMAL",
    "reason":"Checkup"
  }'
```

### Using the Frontend:
```
1. Go to: http://localhost:5173/check-in
2. Enter phone number: +15551234567
3. Complete check-in
4. ✅ SMS sent automatically!
```

---

## ⚙️ Configuration Options

### Current Settings:
```env
SMS_ENABLED=true              # Enable/disable SMS
SMS_MOCK_MODE=true           # true=logs only, false=real SMS
SMS_SEND_ON_CHECKIN=true     # Send on check-in
SMS_SEND_ON_CALLED=true      # Send when called
SMS_MIN_INTERVAL_MINUTES=5   # Min time between SMS
```

### Customize in `.env`:
```bash
nano backend/.env
```

---

## 💰 Cost Tracking

### Check Your Usage:
```bash
curl http://localhost:3000/api/sms/stats
```

Response:
```json
{
  "today": {
    "sent": 12,
    "delivered": 12,
    "cost": 0.09
  },
  "enabled": true,
  "mockMode": false
}
```

### Pricing:
- **US SMS**: $0.0075 per message
- **$15 trial credit** = ~2,000 free SMS!

---

## 🔧 Troubleshooting

### SMS Not Sending?

1. **Check Logs:**
```bash
tail -f backend.log | grep SMS
```

2. **Verify Configuration:**
```bash
cat backend/.env | grep SMS
```

3. **Test Twilio Connection:**
```bash
# In backend directory
node -e "
const twilio = require('twilio');
const client = twilio(
  'YOUR_ACCOUNT_SID',
  'YOUR_AUTH_TOKEN'
);
client.messages.list({limit: 1})
  .then(msgs => console.log('✅ Twilio connected!'))
  .catch(err => console.error('❌ Error:', err));
"
```

### Trial Account Limitations:

**Problem:** SMS only sends to verified numbers  
**Solution:** Add numbers in Twilio Console:
```
Console → Phone Numbers → Verified Caller IDs
→ Add your test phone numbers
```

### Wrong Phone Format:

**Correct:** `+15551234567`  
**Wrong:** `5551234567` or `555-123-4567`

---

## 📊 API Documentation

### New SMS Endpoints:

```
GET  /api/sms/stats     - Get SMS statistics
POST /api/sms/test      - Send test SMS
```

View in Swagger:
```
http://localhost:3000/api/docs#/sms
```

---

## 🎯 Next Steps

### To Enable Real SMS:
1. ✅ Sign up for Twilio
2. ✅ Get credentials
3. ✅ Update `.env`
4. ✅ Install twilio package
5. ✅ Test!

### To Customize Messages:
Edit: `backend/src/sms/sms.service.ts`  
Look for message templates

### To Add More Triggers:
See: `SMS_INTEGRATION_GUIDE.md`

---

## 📱 SMS Status

### Current Mode: **MOCK** (Safe Testing)
```
✅ SMS service initialized
✅ Logs to console
✅ No costs incurred
✅ Test all features
```

### When you enable Twilio:
```
✅ Real SMS sent
✅ Patients receive texts
✅ ~$0.0075 per SMS
✅ Trial credit available
```

---

## ✅ Quick Commands

```bash
# Install Twilio
cd backend && npm install twilio

# Check SMS logs
tail -f ../backend.log | grep SMS

# Test SMS
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"to":"+YOUR_PHONE","message":"Test!"}'

# View SMS stats
curl http://localhost:3000/api/sms/stats

# Edit configuration
nano backend/.env
```

---

## 🎉 You're Ready!

Your system now supports SMS notifications! 

- **Mock mode**: Already working ✅
- **Real SMS**: Just add Twilio credentials

**Try it:** Check in a patient at http://localhost:5173/check-in

Need help? Check `SMS_INTEGRATION_GUIDE.md` for detailed documentation!

