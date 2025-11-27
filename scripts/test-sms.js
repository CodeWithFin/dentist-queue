#!/usr/bin/env node

/**
 * SMS Testing Script
 * Tests all SMS outputs and sends to +254746551520
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const TEST_PHONE = '+254746551520';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSmsEndpoint() {
  log('\n📱 Testing SMS Test Endpoint', 'cyan');
  log('='.repeat(50), 'cyan');
  
  try {
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: 'Test SMS from Dentist Queue System! This is a test message to verify SMS functionality.',
    });
    
    log('✅ SMS Test Endpoint: SUCCESS', 'green');
    log(`   Status: ${response.data.status}`, 'green');
    log(`   To: ${response.data.to}`, 'green');
    log(`   Message: ${response.data.message}`, 'green');
    log(`   Timestamp: ${response.data.timestamp}`, 'green');
    return true;
  } catch (error) {
    log('❌ SMS Test Endpoint: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testSmsStats() {
  log('\n📊 Testing SMS Stats Endpoint', 'cyan');
  log('='.repeat(50), 'cyan');
  
  try {
    const response = await axios.get(`${API_BASE}/sms/stats`);
    
    log('✅ SMS Stats Endpoint: SUCCESS', 'green');
    log(`   Enabled: ${response.data.enabled}`, 'green');
    log(`   Mock Mode: ${response.data.mockMode}`, 'green');
    log(`   Today - Sent: ${response.data.today?.sent || 0}`, 'green');
    log(`   Today - Delivered: ${response.data.today?.delivered || 0}`, 'green');
    log(`   Today - Failed: ${response.data.today?.failed || 0}`, 'green');
    return true;
  } catch (error) {
    log('❌ SMS Stats Endpoint: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testAppointmentConfirmationSms() {
  log('\n📅 Testing Appointment Confirmation SMS Format', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const testMessage = 'Appointment Confirmed! Your Dental Cleaning appointment is scheduled for Nov 27, 2025 at 10:30 AM. See you then!';
  
  try {
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: testMessage,
    });
    
    log('✅ Appointment Confirmation SMS: SUCCESS', 'green');
    log(`   Message Format: ${testMessage}`, 'green');
    log(`   Status: ${response.data.status}`, 'green');
    return true;
  } catch (error) {
    log('❌ Appointment Confirmation SMS: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testCheckInSms() {
  log('\n✅ Testing Check-In SMS Format', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const testMessage = '✅ You\'re now in the queue at Dental Clinic! You\'re #3 in the queue. Estimated wait time: 15 minutes. We\'ll notify you when it\'s your turn.';
  
  try {
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: testMessage,
    });
    
    log('✅ Check-In SMS: SUCCESS', 'green');
    log(`   Message Format: ${testMessage}`, 'green');
    log(`   Status: ${response.data.status}`, 'green');
    return true;
  } catch (error) {
    log('❌ Check-In SMS: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testCalledToRoomSms() {
  log('\n🔔 Testing Called to Room SMS Format', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const testMessage = '🔔 It\'s your turn! Dr. Michael Chen is ready to check you at Room 1. Please proceed to the room now.';
  
  try {
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: testMessage,
    });
    
    log('✅ Called to Room SMS: SUCCESS', 'green');
    log(`   Message Format: ${testMessage}`, 'green');
    log(`   Status: ${response.data.status}`, 'green');
    return true;
  } catch (error) {
    log('❌ Called to Room SMS: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function testServiceCompleteSms() {
  log('\n✨ Testing Service Complete SMS Format', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const testMessage = '✨ Thank you for visiting our dental clinic! We hope you had a great experience. Your feedback means a lot to us - please share your thoughts to help us improve our services. We look forward to seeing you again!';
  
  try {
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: testMessage,
    });
    
    log('✅ Service Complete SMS: SUCCESS', 'green');
    log(`   Message Format: ${testMessage}`, 'green');
    log(`   Status: ${response.data.status}`, 'green');
    return true;
  } catch (error) {
    log('❌ Service Complete SMS: FAILED', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🧪 SMS Output Testing Suite', 'blue');
  log('='.repeat(50), 'blue');
  log(`📱 Testing SMS to: ${TEST_PHONE}`, 'yellow');
  log(`🌐 API Base: ${API_BASE}`, 'yellow');
  log('='.repeat(50), 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
  };
  
  // Test 1: Basic SMS endpoint
  if (await testSmsEndpoint()) results.passed++;
  else results.failed++;
  
  // Test 2: SMS Stats
  if (await testSmsStats()) results.passed++;
  else results.failed++;
  
  // Test 3: Appointment Confirmation SMS
  if (await testAppointmentConfirmationSms()) results.passed++;
  else results.failed++;
  
  // Test 4: Check-In SMS
  if (await testCheckInSms()) results.passed++;
  else results.failed++;
  
  // Test 5: Called to Room SMS
  if (await testCalledToRoomSms()) results.passed++;
  else results.failed++;
  
  // Test 6: Service Complete SMS
  if (await testServiceCompleteSms()) results.passed++;
  else results.failed++;
  
  // Summary
  log('\n📊 Test Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`📈 Total: ${results.passed + results.failed}`, 'cyan');
  log('='.repeat(50), 'blue');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Check the errors above.', 'yellow');
    process.exit(1);
  }
}

// Check if backend is running
axios.get(`${API_BASE}/sms/stats`)
  .then(() => {
    log('✅ Backend is running', 'green');
    runAllTests();
  })
  .catch((error) => {
    log('❌ Backend is not running or not accessible', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Make sure the backend is running on ${API_BASE}`, 'yellow');
    process.exit(1);
  });

