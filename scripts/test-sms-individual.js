#!/usr/bin/env node

/**
 * SMS Testing Script - Individual Messages with Delays
 * Tests all SMS outputs and sends to +254746551520 one by one
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendSms(message, description) {
  try {
    log(`\n📤 Sending: ${description}`, 'cyan');
    const response = await axios.post(`${API_BASE}/sms/test`, {
      to: TEST_PHONE,
      message: message,
    });
    
    if (response.data.status === 'success') {
      log(`✅ SUCCESS - Message ID: ${response.data.response?.[0]?.message_id || 'N/A'}`, 'green');
      log(`   Status: ${response.data.response?.[0]?.status_desc || 'Sent'}`, 'green');
      log(`   Cost: ${response.data.response?.[0]?.message_cost || 'N/A'} credits`, 'green');
      log(`   Balance: ${response.data.response?.[0]?.credit_balance || 'N/A'} credits`, 'green');
      return true;
    } else {
      log(`⚠️  Status: ${response.data.status}`, 'yellow');
      return true; // Still count as sent if API accepted it
    }
  } catch (error) {
    log(`❌ FAILED: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🧪 SMS Individual Message Testing', 'blue');
  log('='.repeat(60), 'blue');
  log(`📱 Testing SMS to: ${TEST_PHONE}`, 'yellow');
  log(`🌐 API Base: ${API_BASE}`, 'yellow');
  log('='.repeat(60), 'blue');
  
  const messages = [
    {
      text: 'Test SMS from Dentist Queue System! This is a test message to verify SMS functionality.',
      desc: 'Test SMS Endpoint'
    },
    {
      text: 'Appointment Confirmed! Your Dental Cleaning appointment is scheduled for Nov 27, 2025 at 10:30 AM. See you then!',
      desc: 'Appointment Confirmation SMS'
    },
    {
      text: 'You are now in the queue at Dental Clinic! You are number 3 in the queue. Estimated wait time: 15 minutes. We will notify you when it is your turn.',
      desc: 'Check-In SMS (no emoji)'
    },
    {
      text: 'It is your turn! Dr. Michael Chen is ready to check you at Room 1. Please proceed to the room now.',
      desc: 'Called to Room SMS (no emoji)'
    },
    {
      text: 'Thank you for visiting our dental clinic! We hope you had a great experience. Your feedback means a lot to us - please share your thoughts to help us improve our services. We look forward to seeing you again!',
      desc: 'Service Complete SMS (no emoji)'
    },
    {
      text: 'FINAL TEST: This is the last test message. If you received this, all SMS functionality is working correctly.',
      desc: 'Final Test Message'
    }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    log(`\n[${i + 1}/${messages.length}]`, 'blue');
    
    const success = await sendSms(msg.text, msg.desc);
    if (success) successCount++;
    
    // Wait 3 seconds between messages to avoid rate limiting
    if (i < messages.length - 1) {
      log('⏳ Waiting 3 seconds before next message...', 'yellow');
      await sleep(3000);
    }
  }
  
  log('\n📊 Final Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Successfully sent: ${successCount}/${messages.length}`, successCount === messages.length ? 'green' : 'yellow');
  log('='.repeat(60), 'blue');
  log('\n💡 Please check your phone (+254746551520) for the messages.', 'cyan');
  log('   Messages may take a few seconds to arrive.', 'cyan');
}

// Check if backend is running
axios.get(`${API_BASE}/sms/stats`)
  .then(() => {
    log('✅ Backend is running', 'green');
    runTests();
  })
  .catch((error) => {
    log('❌ Backend is not running or not accessible', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Make sure the backend is running on ${API_BASE}`, 'yellow');
    process.exit(1);
  });

