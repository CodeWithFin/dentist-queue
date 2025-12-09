const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_PHONE = '0746551520';

async function testSMS() {
  console.log('🧪 SMS Testing for', TEST_PHONE);
  console.log('='.repeat(60), '\n');

  try {
    // 1. Test Manual SMS
    console.log('1️⃣  Sending test SMS...');
    const response = await axios.post(`${API_URL}/sms/test`, {
      to: TEST_PHONE,
      message: 'Hello! This is a test SMS from your Dentist Queue Management System. Testing complete! ✅'
    });
    
    console.log('✅ SMS Sent Successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // 2. Get Stats
    console.log('\n2️⃣  Getting SMS Statistics...');
    const stats = await axios.get(`${API_URL}/sms/stats`);
    console.log('✅ SMS Stats:');
    console.log('   Total Sent:', stats.data.totalSent);
    console.log('   Success Rate:', stats.data.successRate + '%');
    console.log('   Failed:', stats.data.failed);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST COMPLETE!');
    console.log('📱 Check phone', TEST_PHONE, 'for the SMS message');
    console.log('='.repeat(60), '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSMS();
