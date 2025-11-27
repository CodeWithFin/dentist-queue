# 📱 SMS Notifications - Quick Reference

## ✅ Status: **ACTIVE** (Mock Mode)

Your system sends SMS notifications automatically when:
- ✅ Patient checks in
- ✅ Patient is called to room  
- ✅ Queue position changes significantly

---

## 🚀 Quick Test

```bash
# Test SMS endpoint
curl -X POST http://localhost:3000/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{"to":"+15551234567","message":"Test!"}'

# Check stats
curl http://localhost:3000/api/sms/stats

# View SMS logs
tail -f /home/finley/siscom/sidequest/dentist-queue-management-system/backend.log | grep SMS
```

---

## 📊 Current Configuration

**Mode:** Mock (logs only, no real SMS, no costs)  
**Status:** Enabled ✅  
**Rate Limit:** 1 SMS per 5 minutes per patient  
**Business Hours:** 8 AM - 6 PM  

---

## 📱 Message Examples

**Check-in:**
> "Welcome to Your Dental Clinic! You're #23 in queue, position 5. Estimated wait: ~20 minutes."

**Called to Room:**
> "🔔 You're being called! Please proceed to Treatment Room 2."

---

## 🔧 Configuration

Edit: `/home/finley/siscom/sidequest/dentist-queue-management-system/backend/.env`

```env
SMS_ENABLED=true
SMS_MOCK_MODE=true  # Change to false for real SMS
```

---

## 💰 Enable Real SMS (Optional)

1. **Get Twilio account**: https://www.twilio.com/try-twilio ($15 free credit)
2. **Install Twilio**: `cd backend && npm install twilio`
3. **Update .env**:
   ```env
   SMS_MOCK_MODE=false
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+15551234567
   ```
4. **Restart backend** (auto-reloads)

**Cost:** ~$0.0075 per SMS (~$2/day for 100 patients)

---

## 📚 Full Documentation

- `SMS_QUICK_SETUP.md` - 5-minute setup guide
- `SMS_INTEGRATION_GUIDE.md` - Complete documentation
- `SMS_IMPLEMENTATION_COMPLETE.md` - Implementation details
- API Docs: http://localhost:3000/api/docs#/sms

---

## 🧪 Try It!

**Frontend Check-In:**
1. Go to: http://localhost:5173/check-in
2. Enter patient info with phone: `+15551234567`
3. Complete check-in
4. Check logs: `tail -f backend.log | grep SMS`
5. See SMS confirmation! ✅

**API Check-In:**
```bash
# 1. Create patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John","lastName":"Doe",
    "phone":"+15551234567","email":"john@test.com"
  }'

# 2. Check in (use patientId from response)
curl -X POST http://localhost:3000/api/queue/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "patientId":"PATIENT_ID",
    "priority":"NORMAL",
    "reason":"Checkup"
  }'

# 3. Check logs
tail -f backend.log | grep SMS
```

---

## 🎯 API Endpoints

```
POST /api/sms/test   - Send test SMS
GET  /api/sms/stats  - Get usage statistics
```

**Swagger:** http://localhost:3000/api/docs#/sms

---

## ✅ Features

- ✅ Check-in confirmation
- ✅ Called to room alert
- ✅ Position update notifications  
- ✅ Rate limiting
- ✅ Business hours check
- ✅ Cost tracking
- ✅ Mock mode (safe testing)
- ✅ Twilio ready (when enabled)

---

**Current Mode: MOCK (Safe Testing)**  
**Cost: $0.00**  
**Status: Working ✅**

Switch to real SMS anytime by updating `.env` and adding Twilio credentials!

