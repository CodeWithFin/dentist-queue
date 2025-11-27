# TestSprite Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Application (2 minutes)

```bash
# Clone and navigate to project
cd dentist-queue-management-system

# Quick start
./start.sh

# Choose option 1 (Development) or 2 (Production)
# Wait for "Setup complete!" message
```

**Verify it's running:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/health

---

### Step 2: Create TestSprite Account (1 minute)

1. Go to https://www.testsprite.com/
2. Sign up for free account
3. Verify your email
4. Log in to dashboard

---

### Step 3: Create Project in TestSprite (1 minute)

1. Click "New Project"
2. **Project Name**: `Dentist Queue System`
3. **Application URL**: `http://localhost:5173`
4. **Type**: React SPA
5. Click "Create"

---

### Step 4: Import Test Configuration (30 seconds)

**Option A: Upload Config File**
```bash
# If TestSprite supports config import
Upload: testsprite.config.json
```

**Option B: Use Natural Language**
```
Copy test scenarios from TESTSPRITE_GUIDE.md
Paste into TestSprite's test creator
```

---

### Step 5: Run Your First Test (30 seconds)

1. Select "Patient Check-In Flow" test
2. Click "Run Test"
3. Watch it execute in real-time! 🎉

---

## 📋 Essential Test Scenarios

### Critical Path Tests (Run These First!)

#### ✅ Test 1: New Patient Check-In
**What it tests:** Complete patient registration and queue entry

**Natural Language for TestSprite:**
```
1. Go to /check-in
2. Enter phone "+15551234567"
3. Click Continue
4. Fill in "John" as first name
5. Fill in "Doe" as last name  
6. Click Register & Continue
7. Select priority "Normal"
8. Enter reason "Checkup"
9. Click Complete Check-In
10. Verify queue number appears
```

**Expected Result:** Patient gets queue number and position

---

#### ✅ Test 2: Reception Dashboard
**What it tests:** Queue management functionality

**Natural Language for TestSprite:**
```
1. Go to /reception
2. Verify "In Queue" statistic shows
3. Click "Call" on first patient
4. Select first available room
5. Click Confirm
6. Verify patient moves to "In Progress"
```

**Expected Result:** Patient successfully called to room

---

#### ✅ Test 3: Real-Time Updates
**What it tests:** WebSocket functionality

**Natural Language for TestSprite:**
```
1. Open patient status page
2. Wait 3 seconds for WebSocket connection
3. Verify position updates automatically
4. Check ETA is displayed
```

**Expected Result:** Real-time updates work

---

## 🎯 Quick Test Commands

### Run Specific Test Suite

```javascript
// In TestSprite dashboard
Run Suite: "Patient Flows"        // All patient-related tests
Run Suite: "Reception Operations"  // Reception dashboard tests
Run Suite: "API Tests"            // Backend API tests
```

### Run Single Test

```javascript
Run Test: "new-patient-checkin"   // Just the check-in flow
Run Test: "call-patient"          // Just call patient test
```

---

## 🔍 Debugging Failed Tests

### Common Failures & Fixes

#### ❌ "Element not found"
**Fix:** Add wait time
```javascript
Wait 3 seconds
Then find element
```

#### ❌ "WebSocket not connected"
**Fix:** Increase connection timeout
```javascript
Wait 5 seconds after page load
```

#### ❌ "Phone number already exists"
**Fix:** Use timestamp for unique numbers
```javascript
Phone: "+1555" + timestamp
```

#### ❌ "API timeout"
**Fix:** Check backend is running
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

## 📊 Test Results Dashboard

### What to Check After Tests Run

✅ **Pass Rate**: Should be > 95%  
✅ **Response Time**: Should be < 2 seconds  
✅ **WebSocket Latency**: Should be < 500ms  
✅ **API Calls**: All should return 200/201  

### Red Flags 🚩

- Pass rate < 80%
- Multiple timeout errors
- WebSocket disconnections
- API 500 errors

---

## 🔄 Continuous Testing

### Schedule Regular Tests

```javascript
// In TestSprite dashboard

Schedule: Daily at 2:00 AM
Suite: "Full Test Suite"
Notify: team@example.com on failure

Schedule: Every hour
Suite: "Critical Path Tests"  
Notify: Slack #alerts on failure

Schedule: On every deploy
Suite: "Smoke Tests"
Notify: GitHub status check
```

---

## 📝 Test Data

### Sample Data for Testing

**Patients:**
```
Phone: +15551000001 → Alice Smith
Phone: +15551000002 → Bob Jones
Phone: +15551000003 → Carol White
```

**Rooms:**
```
R101 - Treatment Room 1
R102 - Treatment Room 2
R103 - Treatment Room 3
```

**Test Scenarios:**
```
Emergency: "Severe tooth pain"
Urgent: "Lost filling"
Appointment: "Regular checkup"
Normal: "Consultation"
```

---

## 🆘 Quick Troubleshooting

### Application Not Starting?

```bash
# Check if ports are in use
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Restart everything
docker-compose down
docker-compose up -d
```

### Tests Failing Randomly?

1. **Increase timeouts** (3→5 seconds)
2. **Add explicit waits** before assertions
3. **Clear browser data** between tests
4. **Check network latency**

### Can't Connect to Application?

```bash
# Verify services are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
```

---

## 📈 Performance Benchmarks

### Expected Test Execution Times

| Test Suite | Duration | Assertions |
|------------|----------|------------|
| Patient Check-In | 30s | 8 |
| Reception Operations | 45s | 12 |
| Dentist Dashboard | 25s | 6 |
| API Tests | 15s | 15 |
| Full Suite | 3-5min | 50+ |

### Performance Thresholds

- ✅ Page Load: < 2 seconds
- ✅ API Response: < 500ms
- ✅ WebSocket Connection: < 1 second
- ✅ Real-time Update: < 2 seconds

---

## 🎓 TestSprite Pro Tips

### 1. Use Descriptive Test Names
```
✅ Good: "New patient checks in with emergency priority"
❌ Bad: "Test 1"
```

### 2. Add Screenshots at Key Points
```javascript
Take screenshot after each major step
Especially before/after state changes
```

### 3. Group Related Tests
```
Suite: Patient Flows
  ↳ New patient
  ↳ Existing patient
  ↳ Emergency check-in
```

### 4. Use Test Data Wisely
```javascript
// Use timestamps for uniqueness
Phone: "+1555" + Date.now()
Email: "test" + timestamp + "@example.com"
```

### 5. Test Both Happy & Sad Paths
```
✅ Successful check-in
✅ Duplicate check-in (should fail)
✅ Invalid phone number (should validate)
```

---

## 📞 Support & Resources

### Documentation
- **Full Guide**: TESTSPRITE_GUIDE.md
- **Test Config**: testsprite.config.json
- **API Docs**: API.md
- **Deployment**: DEPLOYMENT.md

### TestSprite Resources
- **Documentation**: https://docs.testsprite.com/
- **Support**: support@testsprite.com
- **Community**: https://community.testsprite.com/

### Project Support
- **GitHub Issues**: Report bugs
- **Email**: team@example.com
- **Slack**: #dentist-queue-dev

---

## ✅ Pre-Test Checklist

Before running tests, verify:

- [ ] Application is running (`./start.sh`)
- [ ] Can access frontend (http://localhost:5173)
- [ ] Backend health check passes (http://localhost:3000/api/health)
- [ ] Database is migrated
- [ ] Redis is connected
- [ ] No other tests running
- [ ] TestSprite account is active
- [ ] Project is configured
- [ ] Network connection is stable

---

## 🎉 Success Criteria

Your tests are working correctly if:

1. ✅ All critical path tests pass
2. ✅ Real-time updates work
3. ✅ API responses are fast (< 500ms)
4. ✅ No timeout errors
5. ✅ Screenshots show correct UI
6. ✅ Test execution is consistent

---

## 🚦 What's Next?

After successful test run:

1. **Review Results** - Check pass/fail rates
2. **Fix Failures** - Address any issues found
3. **Schedule Tests** - Set up continuous testing
4. **Add More Tests** - Expand test coverage
5. **Monitor Trends** - Track performance over time
6. **Integrate CI/CD** - Automate on deployments

---

## 💡 Quick Commands Reference

```bash
# Start application
./start.sh

# Check health
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Reset database
cd backend && npx prisma migrate reset

# Run local tests
cd frontend && npm run test:e2e
```

---

**🦷 Happy Testing! You're all set to test with TestSprite! 🧪**

**Questions?** Check TESTSPRITE_GUIDE.md for detailed instructions.

