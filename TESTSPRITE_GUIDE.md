# TestSprite Testing Guide - Dentist Queue Management System

## Overview

This guide helps you test the Dentist Queue Management System using TestSprite, an AI-powered automated testing platform.

## Prerequisites

1. **Running Application**
   - Start the application before testing
   - Development: `./start.sh` or `npm run dev`
   - Production: `docker-compose up -d`

2. **TestSprite Account**
   - Sign up at https://www.testsprite.com/
   - Access the TestSprite Dashboard

3. **Application URLs**
   - **Development**: http://localhost:5173
   - **Production**: http://localhost
   - **API**: http://localhost:3000/api

---

## Quick Start

### 1. Start Your Application

```bash
# Option 1: Quick start script
./start.sh

# Option 2: Docker Compose
docker-compose up -d

# Option 3: Development mode
docker-compose up -d postgres redis
cd backend && npm run start:dev &
cd frontend && npm run dev &
```

Wait for services to be ready (~30 seconds).

### 2. Access TestSprite

1. Go to https://www.testsprite.com/
2. Log in to your account
3. Create a new project

### 3. Configure Project in TestSprite

**Project Settings:**
- **Project Name**: Dentist Queue Management System
- **Application URL**: http://localhost:5173 (or your deployed URL)
- **Application Type**: React SPA
- **Authentication**: None (currently)

---

## Test Scenarios

### Critical User Flows

TestSprite can automatically generate tests, but here are the key scenarios to ensure are covered:

#### 1. Patient Check-In Flow (End-to-End)

**Scenario**: New patient walks in and checks into the queue

**Natural Language Description for TestSprite:**
```
1. Navigate to the check-in page
2. Enter a new phone number "+1555000XXXX" (use random number)
3. Click "Continue" button
4. Fill in first name "John"
5. Fill in last name "Doe"
6. Fill in email "john.doe@test.com"
7. Click "Register & Continue"
8. Wait for welcome message
9. Select priority "Normal Walk-in"
10. Enter reason "Regular checkup"
11. Enter notes "First visit"
12. Click "Complete Check-In"
13. Verify redirect to status page
14. Verify queue number is displayed
15. Verify position is shown
16. Verify estimated wait time is shown
```

**Expected Results:**
- ✅ Patient successfully registered
- ✅ Queue number assigned
- ✅ Status page displays correctly
- ✅ Real-time position updates work

#### 2. Existing Patient Check-In

**Scenario**: Returning patient checks in

**Natural Language Description:**
```
1. Navigate to check-in page
2. Enter existing phone number
3. Click "Continue"
4. Verify patient name is displayed
5. Select priority level
6. Enter reason for visit
7. Complete check-in
8. Verify queue confirmation
```

#### 3. Reception Dashboard - Queue Management

**Scenario**: Reception staff manages the queue

**Natural Language Description:**
```
1. Navigate to /reception
2. Verify dashboard loads with statistics
3. Check "In Queue" counter is visible
4. Check "Waiting" section shows patients
5. Click "Call" button on first patient
6. Select a room from dropdown
7. Click "Confirm"
8. Verify patient moves to "In Progress"
9. Click "Start Service" on called patient
10. Verify status changes to "IN_SERVICE"
11. Click "Complete" button
12. Verify patient removed from queue
```

#### 4. Real-Time Updates

**Scenario**: Multiple dashboards receive real-time updates

**Natural Language Description:**
```
1. Open patient status page in one browser
2. Open reception dashboard in another browser
3. Call the patient from reception
4. Verify notification appears on patient page
5. Verify position updates in real-time
```

#### 5. Priority Queue Testing

**Scenario**: Emergency patient gets priority

**Natural Language Description:**
```
1. Check in a Normal priority patient
2. Note their position
3. Check in an Emergency priority patient
4. Verify Emergency patient is first in queue
5. Verify Normal patient position increased
```

#### 6. Dentist Dashboard

**Scenario**: Dentist manages rooms and patients

**Natural Language Description:**
```
1. Navigate to /dentist
2. Verify "My Patients" section loads
3. Verify "Waiting Queue" preview shows
4. Find a room in "Room Management"
5. Click "Occupied" to change room status
6. Verify status updates
7. Click "Free" to mark room available
8. Complete a patient service
9. Verify room becomes available
```

#### 7. Public Display Screen

**Scenario**: Waiting room display updates

**Natural Language Description:**
```
1. Navigate to /display
2. Verify "Now Serving" section appears
3. Verify waiting queue table shows all patients
4. Wait for auto-refresh
5. Verify data updates automatically
```

---

## TestSprite Configuration

### Test Suite Structure

Create the following test suites in TestSprite:

#### Suite 1: Patient Flows
- New patient registration
- Existing patient check-in
- Emergency check-in
- Appointment-based check-in
- Cancel check-in

#### Suite 2: Reception Operations
- View queue
- Call patient
- Start service
- Complete service
- Remove from queue
- View statistics

#### Suite 3: Dentist Operations
- View assigned patients
- Update room status
- Complete patient visit
- View waiting queue

#### Suite 4: Real-Time Features
- WebSocket connection
- Position updates
- Call notifications
- Queue refresh

#### Suite 5: Edge Cases
- Duplicate check-in prevention
- Invalid phone number
- Empty queue handling
- Network interruption recovery

---

## API Testing with TestSprite

TestSprite can also test REST APIs. Configure API tests for:

### Health Check

```
GET http://localhost:3000/api/health
Expected: 200 OK
Expected Response: { "status": "ok" }
```

### Create Patient

```
POST http://localhost:3000/api/patients
Content-Type: application/json

Body:
{
  "firstName": "Test",
  "lastName": "Patient",
  "phone": "+15550001234",
  "email": "test@example.com"
}

Expected: 201 Created
Expected Response: Patient object with id
```

### Check In Patient

```
POST http://localhost:3000/api/queue/check-in
Content-Type: application/json

Body:
{
  "patientId": "{patient_id}",
  "priority": "NORMAL",
  "reason": "Test visit"
}

Expected: 201 Created
Expected Response: Queue entry with position
```

### Get Queue

```
GET http://localhost:3000/api/queue
Expected: 200 OK
Expected Response: Array of queue entries
```

---

## Test Data Setup

### Sample Test Data

Before running tests, you may want to seed the database:

**Sample Patients:**
```json
[
  { "firstName": "Alice", "lastName": "Smith", "phone": "+15551000001" },
  { "firstName": "Bob", "lastName": "Jones", "phone": "+15551000002" },
  { "firstName": "Carol", "lastName": "White", "phone": "+15551000003" }
]
```

**Sample Rooms:**
```json
[
  { "roomNumber": "R101", "name": "Treatment Room 1", "status": "AVAILABLE" },
  { "roomNumber": "R102", "name": "Treatment Room 2", "status": "AVAILABLE" },
  { "roomNumber": "R103", "name": "Treatment Room 3", "status": "AVAILABLE" }
]
```

**Sample Providers:**
```json
[
  { 
    "firstName": "Dr. Jane", 
    "lastName": "Smith", 
    "email": "jane.smith@dentist.com",
    "phone": "+15559000001",
    "licenseNo": "DEN123456"
  }
]
```

### Database Reset Script

Create this script for test isolation:

```bash
# backend/scripts/reset-test-db.sh
#!/bin/bash
npx prisma migrate reset --force --skip-seed
npx prisma migrate deploy
```

---

## TestSprite Best Practices

### 1. Test Isolation

- Reset database between test runs
- Use unique identifiers (timestamps)
- Clean up test data after execution

### 2. Wait Strategies

- Allow time for WebSocket connections (2-3 seconds)
- Wait for API responses before assertions
- Use explicit waits for dynamic content

### 3. Assertion Points

**Patient Check-In:**
- ✓ Form validation messages
- ✓ Success notifications
- ✓ Queue number assignment
- ✓ Redirect behavior
- ✓ Data persistence

**Queue Management:**
- ✓ Patient appears in queue
- ✓ Correct position
- ✓ Accurate ETA
- ✓ Status transitions
- ✓ Room assignments

**Real-Time Updates:**
- ✓ WebSocket connection established
- ✓ Events received within 2 seconds
- ✓ UI updates correctly
- ✓ No duplicate notifications

### 4. Error Scenarios

Test these failure cases:
- Invalid input data
- Network timeout
- Database connection loss
- Redis unavailable
- WebSocket disconnection
- Duplicate check-in attempts

---

## Running Tests with TestSprite

### Manual Test Execution

1. **Start Application**
   ```bash
   ./start.sh
   ```

2. **Open TestSprite Dashboard**
   - Navigate to your project
   - Select test suite

3. **Execute Tests**
   - Click "Run Tests"
   - Select environment (local/staging/production)
   - Choose browser (Chrome/Firefox/Safari)

4. **Monitor Execution**
   - Watch real-time preview
   - Check console logs
   - Review screenshots

5. **Analyze Results**
   - Review passed/failed tests
   - Check error messages
   - View execution videos
   - Export reports

### Scheduled Testing

Set up automated test runs:

1. **Configure Schedule**
   - Daily: Run full test suite at 2 AM
   - On Deploy: Run smoke tests
   - Hourly: Run critical path tests

2. **Notifications**
   - Email on failures
   - Slack integration
   - GitHub status checks

---

## TestSprite Test Scripts

### Example Test Script Format

If TestSprite supports custom scripts, use this format:

```javascript
// patient-checkin.testsprite.js
describe('Patient Check-In Flow', () => {
  it('should allow new patient to check in', async () => {
    // Navigate to check-in page
    await navigate('http://localhost:5173/check-in');
    
    // Enter phone number
    const phone = `+1555${Date.now()}`;
    await type('[placeholder="+1234567890"]', phone);
    await click('button:contains("Continue")');
    
    // Wait for registration form
    await waitForText('New Patient Registration', 10000);
    
    // Fill registration
    await type('input[label="First Name"]', 'John');
    await type('input[label="Last Name"]', 'Doe');
    await type('input[label="Email"]', 'john@test.com');
    await click('button:contains("Register & Continue")');
    
    // Wait for welcome message
    await waitForText('Welcome, John Doe', 10000);
    
    // Complete check-in
    await select('[label="Priority"]', 'NORMAL');
    await type('textarea[label="Reason for Visit"]', 'Regular checkup');
    await click('button:contains("Complete Check-In")');
    
    // Verify redirect and queue number
    await waitForUrlContains('/patient/');
    await assertVisible('h2:contains("#")'); // Queue number
    await assertVisible('text:contains("Position")');
    await assertVisible('text:contains("Minutes Wait")');
  });
});
```

---

## Performance Testing with TestSprite

### Load Testing Scenarios

1. **Concurrent Check-Ins**
   - Simulate 50 patients checking in simultaneously
   - Verify all get unique queue numbers
   - Check response times stay < 2 seconds

2. **Real-Time Update Load**
   - 100 concurrent dashboard viewers
   - Verify all receive updates
   - Check WebSocket stability

3. **API Stress Test**
   - 1000 requests per minute
   - Monitor error rates
   - Check database connection pool

---

## Troubleshooting TestSprite Tests

### Common Issues

#### 1. WebSocket Connection Failures

**Problem**: Real-time updates not working in tests

**Solutions:**
- Increase wait time after navigation (3-5 seconds)
- Verify WebSocket URL is accessible
- Check CORS settings
- Ensure Socket.io handshake completes

#### 2. Element Not Found

**Problem**: TestSprite can't find UI elements

**Solutions:**
- Add explicit waits
- Use more specific selectors
- Check for dynamic content loading
- Verify element is in viewport

#### 3. Race Conditions

**Problem**: Tests fail intermittently

**Solutions:**
- Add explicit waits instead of fixed delays
- Wait for specific elements/conditions
- Disable animations in test mode
- Use TestSprite's smart wait features

#### 4. Test Data Conflicts

**Problem**: Tests fail due to existing data

**Solutions:**
- Reset database before each run
- Use unique identifiers (timestamps)
- Implement proper test cleanup
- Use test-specific environment

---

## CI/CD Integration

### GitHub Actions with TestSprite

```yaml
# .github/workflows/testsprite.yml
name: TestSprite E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Application
        run: |
          docker-compose up -d
          sleep 30
      
      - name: Run TestSprite Tests
        env:
          TESTSPRITE_API_KEY: ${{ secrets.TESTSPRITE_API_KEY }}
        run: |
          # Trigger TestSprite test run via API
          curl -X POST https://api.testsprite.com/v1/tests/run \
            -H "Authorization: Bearer $TESTSPRITE_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "project_id": "your-project-id",
              "suite": "full",
              "environment": "ci",
              "url": "http://localhost:5173"
            }'
      
      - name: Cleanup
        if: always()
        run: docker-compose down
```

---

## Reporting

### Test Reports to Generate

1. **Functional Test Report**
   - Pass/fail status for each test
   - Execution time
   - Screenshots of failures
   - Error logs

2. **Coverage Report**
   - Features tested
   - Untested areas
   - Critical paths covered

3. **Performance Report**
   - Response times
   - Load test results
   - Resource usage

4. **Trend Analysis**
   - Test stability over time
   - Failure patterns
   - Performance trends

---

## Next Steps

1. **Sign up for TestSprite** at https://www.testsprite.com/
2. **Start the application** using `./start.sh`
3. **Create a project** in TestSprite dashboard
4. **Run initial test suite** using the scenarios above
5. **Review and iterate** on test results
6. **Set up scheduled tests** for continuous monitoring

---

## Support

**TestSprite Documentation**: https://docs.testsprite.com/  
**Project Issues**: GitHub Issues  
**Contact**: support@example.com

---

## Checklist

Before running TestSprite tests, ensure:

- [ ] Application is running and accessible
- [ ] Database is migrated and seeded (if needed)
- [ ] Redis is running
- [ ] WebSocket connections work
- [ ] All services are healthy
- [ ] TestSprite account is set up
- [ ] Project is configured in TestSprite
- [ ] Test scenarios are defined
- [ ] Base URL is correct
- [ ] Network allows outbound connections (for cloud testing)

---

**Happy Testing with TestSprite! 🧪🦷**

