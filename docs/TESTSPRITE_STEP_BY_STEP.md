# 🧪 TestSprite Testing - Step-by-Step Guide

## ✅ Your System is Ready to Test!

**Current Status:**
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:3000
- ✅ SMS Integration: Active (Mock Mode)
- ✅ Database: Connected
- ✅ Test Config: Ready (`testsprite.config.json`)

---

## 🚀 Quick Start (Choose Your Path)

### Path 1: TestSprite Cloud Testing (Recommended for AI-powered tests)

#### Step 1: Set Up TestSprite Account (5 minutes)

**A. Create Account:**
1. Visit: https://www.testsprite.com/
2. Click "Sign Up" or "Get Started"
3. Create free account with email
4. Verify email and log in

**B. Create Project:**
1. Click "+ New Project"
2. Fill in:
   - **Name**: Dentist Queue Management System
   - **Type**: Web Application
   - **Framework**: React
   - **URL**: http://localhost:5173
3. Click "Create Project"

**C. Configure Project:**
1. Go to Project Settings
2. Set **API Base URL**: http://localhost:3000/api
3. Enable **WebSocket Testing**
4. Set **Default Timeout**: 30 seconds

---

#### Step 2: Create Your First Test (3 minutes)

**Test #1: Patient Check-In Flow**

In TestSprite, create a new test using natural language:

```
Test Name: New Patient Check-In

Instructions:
1. Navigate to http://localhost:5173/check-in
2. Wait for page to load (3 seconds)
3. Find the phone number input field
4. Type "+15551234567" in the phone field
5. Click the "Continue" button
6. Wait for the registration form to appear
7. Type "John" in the "First Name" field
8. Type "Doe" in the "Last Name" field
9. Type "john.doe@example.com" in the "Email" field
10. Type "1990-01-01" in the "Date of Birth" field
11. Click "Register & Continue" button
12. Wait for check-in form to appear
13. Select "NORMAL" from the Priority dropdown
14. Type "Routine checkup" in the Reason field
15. Click "Complete Check-In" button
16. Wait for success page (up to 10 seconds)
17. Verify that a queue number is displayed on the page
18. Verify that "Position" text appears
19. Verify that "Minutes Wait" or "Estimated Wait" appears
20. Take a screenshot for confirmation

Expected Results:
- Queue number should be displayed (format: #XX)
- Position should be a positive number
- Wait time should be displayed in minutes
- SMS notification should be logged (check backend logs)
```

---

#### Step 3: Add More Critical Tests

**Test #2: Reception Dashboard**

```
Test Name: Reception Queue Management

Instructions:
1. Navigate to http://localhost:5173/reception
2. Wait 3 seconds for dashboard to load
3. Verify "Reception Dashboard" heading appears
4. Verify "In Queue" statistic is visible
5. Verify "Waiting" count is visible
6. Verify patient table or list appears
7. If patients exist, click "Call" button on first patient
8. Select first available room from dropdown
9. Click "Confirm" button
10. Verify success message appears
11. Take screenshot

Expected Results:
- Dashboard loads successfully
- Queue statistics are accurate
- Patient can be called to room
- Real-time updates work
```

**Test #3: API Health Check**

```
Test Name: API Endpoints Health

Type: API Test

Request 1: Health Check
- Method: GET
- URL: http://localhost:3000/api/health
- Expected Status: 200
- Expected Response: {"status": "ok"}

Request 2: Get Queue
- Method: GET
- URL: http://localhost:3000/api/queue
- Expected Status: 200
- Expected Response: Array of queue entries

Request 3: Create Patient
- Method: POST
- URL: http://localhost:3000/api/patients
- Headers: {"Content-Type": "application/json"}
- Body: {
    "firstName": "Test",
    "lastName": "Patient",
    "phone": "+15551234567",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01T00:00:00Z"
  }
- Expected Status: 201
- Expected: Response contains "id" field
```

---

#### Step 4: Import Pre-configured Tests (Optional)

If TestSprite supports config import:

```bash
# Your project has pre-configured tests in:
testsprite.config.json

# Upload this file to TestSprite:
1. Go to Project Settings
2. Look for "Import Tests" or "Configuration"
3. Upload: /home/finley/siscom/sidequest/dentist-queue-management-system/testsprite.config.json
4. Review and enable all test suites
```

---

#### Step 5: Run Tests

**Run Single Test:**
1. Select your test from the list
2. Click "Run Test"
3. Watch it execute in real-time
4. Review results and screenshots

**Run Test Suite:**
1. Click "Run All Tests" or select a suite
2. TestSprite will execute all tests
3. Get comprehensive report with:
   - Pass/Fail status
   - Screenshots
   - Execution time
   - Error details

---

### Path 2: Local Testing (No Account Needed)

#### Option A: Run Cypress E2E Tests

```bash
# Navigate to frontend
cd /home/finley/siscom/sidequest/dentist-queue-management-system/frontend

# Run Cypress tests
npm run test:e2e

# Or run in headless mode
npm run test:e2e:headless
```

**What This Tests:**
- Patient check-in flow
- Form validations
- UI component interactions
- Navigation flows

---

#### Option B: Run Backend API Tests

```bash
# Navigate to backend
cd /home/finley/siscom/sidequest/dentist-queue-management-system/backend

# Run all tests
npm run test

# Run specific test file
npm run test -- patients.service.spec.ts

# Run with coverage
npm run test:cov
```

**What This Tests:**
- API endpoint responses
- Database operations
- Queue logic
- Service methods
- Error handling

---

#### Option C: Manual Testing Walkthrough

**1. Test Patient Check-In:**

```bash
# Open browser to:
http://localhost:5173/check-in

Steps:
1. Enter phone: +15551234567
2. Click Continue
3. Fill registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@test.com
   - DOB: 01/01/1990
4. Click Register & Continue
5. Fill check-in form:
   - Priority: Normal
   - Reason: Checkup
6. Click Complete Check-In

Expected:
✓ Queue number appears
✓ Position shown
✓ ETA displayed
✓ SMS logged in backend
```

**2. Test Reception Dashboard:**

```bash
# Open browser to:
http://localhost:5173/reception

Steps:
1. View queue statistics
2. See list of waiting patients
3. Click "Call" on first patient
4. Select available room
5. Click Confirm

Expected:
✓ Queue updates in real-time
✓ Patient status changes
✓ Room becomes occupied
✓ SMS sent to patient
```

**3. Test Dentist Dashboard:**

```bash
# Open browser to:
http://localhost:5173/dentist

Steps:
1. View assigned patients
2. View room statuses
3. Click "Free" on a room
4. See room become available

Expected:
✓ Patient list updates
✓ Room status changes
✓ Real-time updates work
```

**4. Test Public Waiting Screen:**

```bash
# Open browser to:
http://localhost:5173/public

Expected:
✓ See all patients in queue
✓ Real-time position updates
✓ Queue numbers visible
✓ Auto-refresh every few seconds
```

**5. Test API Directly:**

```bash
# Health Check
curl http://localhost:3000/api/health

# Get Queue
curl http://localhost:3000/api/queue

# Check SMS Stats
curl http://localhost:3000/api/sms/stats

# Create Patient
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "phone": "+15559876543",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01T00:00:00Z"
  }'
```

---

## 📊 Test Coverage Overview

### Frontend Tests (Cypress)
```
✅ Patient check-in flow
✅ Form validations
✅ Navigation
✅ Component rendering
✅ User interactions
```

### Backend Tests (Jest)
```
✅ API endpoints
✅ Database operations
✅ Queue management
✅ Service logic
✅ Error handling
✅ SMS integration
```

### TestSprite Tests (20+ scenarios)
```
✅ Complete user flows
✅ Real-time updates
✅ WebSocket connections
✅ Edge cases
✅ Cross-browser testing
✅ Mobile responsiveness
```

---

## 🎯 Recommended Testing Strategy

### Day 1: Quick Validation
```
1. Manual testing (30 min)
   - Check all main pages load
   - Test basic check-in flow
   - Verify real-time updates

2. Run local tests (10 min)
   - npm run test (backend)
   - npm run test:e2e (frontend)
```

### Day 2: Comprehensive Testing
```
1. Set up TestSprite account (15 min)
2. Create 3 critical tests (30 min)
3. Run test suite (10 min)
4. Review results and fix issues (varies)
```

### Ongoing: Automated Testing
```
1. Schedule TestSprite tests:
   - Daily at 2 AM
   - On every deployment
   - Before production releases

2. Monitor test results
3. Add new tests as features grow
```

---

## 📈 Success Metrics

### What Good Test Results Look Like:

**Performance:**
- ✅ Page load: < 2 seconds
- ✅ API response: < 500ms
- ✅ WebSocket connection: < 1 second
- ✅ Real-time update: < 2 seconds

**Reliability:**
- ✅ Pass rate: > 95%
- ✅ Flaky tests: < 5%
- ✅ Test execution time: < 5 minutes (full suite)

**Coverage:**
- ✅ Critical paths: 100%
- ✅ API endpoints: 100%
- ✅ UI components: > 80%
- ✅ Edge cases: > 70%

---

## 🔍 Debugging Failed Tests

### Common Issues & Solutions:

**Issue: Element not found**
```
Solution:
- Add wait time (3-5 seconds)
- Check element selector is correct
- Verify page loaded completely
```

**Issue: Timeout errors**
```
Solution:
- Increase timeout to 10 seconds
- Check network connectivity
- Verify backend is responding
```

**Issue: WebSocket not connecting**
```
Solution:
- Wait 3-5 seconds after page load
- Check backend WebSocket server running
- Verify CORS settings
```

**Issue: Data inconsistency**
```
Solution:
- Clear database between tests
- Use unique test data (timestamps)
- Reset application state
```

---

## 📚 Available Documentation

- **TESTSPRITE_GUIDE.md** - Complete TestSprite guide
- **TESTSPRITE_QUICKSTART.md** - Quick reference
- **testsprite.config.json** - Pre-configured tests
- **API.md** - API endpoint documentation
- **SMS_README.md** - SMS feature testing

---

## 🆘 Troubleshooting

### Tests Not Running?

**Check Application Status:**
```bash
# Backend
curl http://localhost:3000/api/health

# Frontend
curl http://localhost:5173

# Database
docker-compose ps postgres

# Redis
docker-compose ps redis
```

**Restart Services:**
```bash
# Restart backend
cd backend && npm run start:dev

# Restart frontend  
cd frontend && npm run dev

# Restart all via Docker
docker-compose restart
```

### Tests Failing Randomly?

1. Increase timeouts (3 → 5 seconds)
2. Add explicit waits before assertions
3. Clear browser data between tests
4. Use unique test data for each run

---

## 🎉 Quick Start Commands

```bash
# Check system is running
curl http://localhost:3000/api/health && curl http://localhost:5173 > /dev/null 2>&1 && echo "✅ System Ready!"

# Run backend tests
cd backend && npm run test

# Run frontend E2E tests
cd frontend && npm run test:e2e

# Check SMS integration
curl http://localhost:3000/api/sms/stats

# View backend logs (for SMS notifications)
tail -f backend.log | grep SMS
```

---

## ✅ Testing Checklist

Before considering testing complete:

- [ ] All critical user flows tested
- [ ] API endpoints validated
- [ ] Real-time features verified
- [ ] SMS notifications working
- [ ] Error handling tested
- [ ] Edge cases covered
- [ ] Performance benchmarks met
- [ ] Cross-browser tested (if using TestSprite)
- [ ] Mobile responsiveness checked
- [ ] Documentation reviewed

---

## 🚀 Next Steps

1. **Start Manual Testing** - Validate basic functionality
2. **Run Local Tests** - Execute Cypress and Jest tests
3. **(Optional) Set Up TestSprite** - For automated AI-powered testing
4. **Schedule Regular Tests** - Set up continuous testing
5. **Monitor & Improve** - Track metrics and add tests

---

**🦷 Your dentist queue system is ready for comprehensive testing!**

**Need Help?**
- Review: `TESTSPRITE_GUIDE.md` for detailed instructions
- Check: `testsprite.config.json` for all test scenarios
- See: `SMS_README.md` for SMS testing guide

**Ready to test? Start with manual testing, then progress to automated tests!** 🧪✨

