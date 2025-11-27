# 📱 Tilil SMS Migration Guide

## ✅ Migration Complete

The SMS service has been successfully migrated from **Twilio** to **Tilil Technologies**.

---

## 🔧 Environment Variables

Update your `backend/.env` file with the following Tilil credentials:

### Remove (Old Twilio Variables):
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### Add (New Tilil Variables):
```env
# Tilil SMS Configuration
SMS_ENABLED=true
SMS_MOCK_MODE=false

# Tilil API Credentials
TILIL_API_KEY=your_tilil_api_key_here
TILIL_SHORTCODE=your_sender_id_here
SMS_ENDPOINT=https://api.tililtech.com/sms/v3/sendsms

# SMS Behavior Settings (unchanged)
SMS_CLINIC_NAME=Your Dental Clinic
SMS_CLINIC_PHONE=+254712345678
SMS_SEND_ON_CHECKIN=true
SMS_SEND_ON_POSITION_CHANGE=true
SMS_SEND_ON_CALLED=true
SMS_SEND_APPOINTMENT_REMINDER=true
SMS_MIN_INTERVAL_MINUTES=5
SMS_POSITION_CHANGE_THRESHOLD=3
SMS_BUSINESS_HOURS_START=08:00
SMS_BUSINESS_HOURS_END=18:00
```

---

## 📋 How to Get Tilil Credentials

1. **Visit Tilil Technologies**: https://tililtech.com/a2p-bulk-sms/
2. **Contact Tilil**:
   - Phone: +254 792-777-888
   - Email: [email protected]
3. **Request**:
   - API Key
   - Shortcode (Sender ID)

---

## 🔄 What Changed

### Code Changes:
- ✅ Removed `twilio` package dependency
- ✅ Added `axios` for HTTP requests
- ✅ Replaced Twilio SDK with Tilil REST API
- ✅ Added phone number formatting (converts to 254XXXXXXXXX format)
- ✅ Updated SMS service to use Tilil endpoint

### API Endpoint:
- **Tilil API**: `https://api.tililtech.com/sms/v3/sendsms`
- **Method**: POST
- **Format**: JSON

### Phone Number Format:
The service automatically formats phone numbers to Tilil's required format:
- Input: `+254726770792`, `0726770792`, `254726770792`
- Output: `254726770792`

---

## 🧪 Testing

1. **Set up environment variables** in `backend/.env`
2. **Start the backend**:
   ```bash
   cd backend
   npm run start:dev
   ```
3. **Send a test SMS**:
   ```bash
   curl -X POST http://localhost:3000/api/sms/test \
     -H "Content-Type: application/json" \
     -d '{
       "to": "+254726770792",
       "message": "Test message from Tilil"
     }'
   ```

---

## 📝 Features (Unchanged)

All SMS features continue to work:
- ✅ Check-in confirmation SMS
- ✅ Queue position updates
- ✅ Called to room notifications
- ✅ Appointment reminders
- ✅ Rate limiting
- ✅ Business hours checking
- ✅ Mock mode for testing

---

## ⚠️ Important Notes

1. **Phone Number Format**: Tilil requires Kenyan phone numbers in `254XXXXXXXXX` format
2. **API Key**: Keep your API key secure and never commit it to version control
3. **Shortcode**: This is your sender ID (must be approved by Tilil)
4. **Service ID**: Set to `0` for bulk messages (handled automatically)

---

## 🆘 Troubleshooting

### SMS not sending?
1. Check `TILIL_API_KEY` and `TILIL_SHORTCODE` are set correctly
2. Verify phone number is in correct format
3. Check backend logs for error messages
4. Ensure `SMS_ENABLED=true` and `SMS_MOCK_MODE=false`

### Testing without real SMS?
Set `SMS_MOCK_MODE=true` in `.env` to enable mock mode (logs SMS without sending)

---

## 📚 Additional Resources

- Tilil Technologies: https://tililtech.com
- API Documentation: Contact Tilil for API docs
- Support: +254 792-777-888 or [email protected]

---

**Migration Date**: $(date +%Y-%m-%d)
**Status**: ✅ Complete

