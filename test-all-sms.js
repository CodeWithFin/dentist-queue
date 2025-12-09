const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_PHONE = '0746551520';

// Helper to delay between tests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data
let patientId;
let queueId;
let appointmentId;

async function testAllSMS() {
  console.log('🧪 Starting Comprehensive SMS Testing...\n');
  console.log('📱 Test Phone Number:', TEST_PHONE);
  console.log('=' .repeat(60));

  try {
    // 1. Create/Get Patient
    console.log('\n1️⃣  Creating patient...');
    const patientResponse = await axios.post(`${API_URL}/patients`, {
      firstName: 'SMS Test',
      lastName: 'Patient',
      phone: TEST_PHONE,
      email: 'test@example.com',
      dateOfBirth: '1990-01-01T00:00:00.000Z'
    }).catch(async (error) => {
      if (error.response?.status === 409) {
        // Patient exists, get by phone
        const existing = await axios.get(`${API_URL}/patients/phone/${TEST_PHONE}`);
        return existing;
      }
      throw error;
    });
    
    patientId = patientResponse.data.id;
    console.log('✅ Patient ID:', patientId);
    
    await delay(2000);

    // 2. Test SMS on Check-in (Walk-in)
    console.log('\n2️⃣  Testing SMS on Check-in (Walk-in)...');
    const checkinResponse = await axios.post(`${API_URL}/queue/check-in`, {
      patientId: patientId,
      reason: 'General Checkup - SMS Test',
      priority: 'NORMAL',
      notes: 'SMS Test - Walk-in'
    });
    
    queueId = checkinResponse.data.id;
    console.log('✅ Checked in. Queue ID:', queueId);
    console.log('📱 Expected SMS: Check-in confirmation with queue position');
    
    await delay(3000);

    // 3. Test Position Change SMS (Add more patients to trigger position change)
    console.log('\n3️⃣  Testing Position Change SMS...');
    console.log('   Adding emergency patient to change queue position...');
    
    const emergencyPatient = await axios.post(`${API_URL}/patients`, {
      firstName: 'Emergency',
      lastName: 'Patient',
      phone: '0712345678',
      email: 'emergency@test.com',
      dateOfBirth: '1985-05-05T00:00:00.000Z'
    }).catch(e => e.response);

    if (emergencyPatient.data?.id) {
      await axios.post(`${API_URL}/queue/check-in`, {
        patientId: emergencyPatient.data.id,
        reason: 'Emergency - Urgent Care',
        priority: 'EMERGENCY',
        notes: 'Emergency case'
      });
      console.log('✅ Emergency patient added - Position change triggered');
      console.log('📱 Expected SMS: Position update notification');
    }
    
    await delay(3000);

    // 4. Test Call Next SMS
    console.log('\n4️⃣  Testing Call Next SMS...');
    const callResponse = await axios.patch(`${API_URL}/queue/${queueId}/call-next`);
    console.log('✅ Patient called to treatment room');
    console.log('📱 Expected SMS: "You are being called" notification');
    
    await delay(3000);

    // 5. Create Appointment for future
    console.log('\n5️⃣  Testing Appointment Reminder SMS...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const appointmentResponse = await axios.post(`${API_URL}/appointments`, {
      patientId: patientId,
      providerId: 1, // Assuming provider exists
      serviceType: 'TEETH_CLEANING',
      scheduledTime: tomorrow.toISOString(),
      duration: 30,
      notes: 'SMS Test - Appointment'
    }).catch(e => {
      console.log('⚠️  Could not create appointment:', e.response?.data?.message);
      return null;
    });
    
    if (appointmentResponse?.data) {
      appointmentId = appointmentResponse.data.id;
      console.log('✅ Appointment created for:', tomorrow.toLocaleString());
      console.log('📱 Expected SMS: Appointment confirmation');
      console.log('💡 Note: Reminder SMS will be sent automatically 24h before');
    }
    
    await delay(2000);

    // 6. Test Manual SMS
    console.log('\n6️⃣  Testing Manual SMS Send...');
    const manualSMS = await axios.post(`${API_URL}/sms/test`, {
      to: TEST_PHONE,
      message: 'This is a manual test SMS from the Dentist Queue Management System. Testing complete! ✅'
    });
    console.log('✅ Manual SMS sent');
    console.log('📱 Expected SMS: Custom test message');

    await delay(2000);

    // 7. Get SMS Stats
    console.log('\n7️⃣  SMS Statistics...');
    const stats = await axios.get(`${API_URL}/sms/stats`);
    console.log('✅ SMS Stats:');
    console.log('   Total Sent:', stats.data.totalSent);
    console.log('   Success Rate:', stats.data.successRate + '%');
    console.log('   Failed:', stats.data.failed);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL SMS TESTS COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📱 Check phone number', TEST_PHONE, 'for the following SMS:');
    console.log('   1. Check-in confirmation with queue position');
    console.log('   2. Position change notification (if position changed)');
    console.log('   3. "You are being called" notification');
    console.log('   4. Appointment confirmation (if appointment created)');
    console.log('   5. Manual test message');
    console.log('\n💡 Appointment reminder will be sent 24h before scheduled time');
    console.log('💡 Total expected SMS: 4-5 messages\n');

  } catch (error) {
    console.error('\n❌ Error during testing:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run tests
testAllSMS();
