/**
 * Test script to verify admin audit configuration
 * Run with: npx tsx scripts/test-admin-audit.ts
 */

import { getAdminAuditData, isAdminAuditPhoneEnabled, getAdminAuditPhoneNumber } from '../lib/repositories/appSettings/getConfig';
import { sendAdminAuditNotification } from '../lib/podium/messages';

async function testAdminAudit() {
  console.log('🔍 Testing Admin Audit Configuration...\n');

  // Test 1: Check if admin audit data exists
  console.log('1. Checking adminAuditData setting...');
  const auditData = await getAdminAuditData();
  if (!auditData) {
    console.log('   ❌ adminAuditData setting not found or is null');
    console.log('   💡 Create it in /dashboard/settings with key: adminAuditData');
    console.log('   💡 Or run: node scripts/importAppSettings.js test\n');
    return;
  }
  console.log('   ✅ adminAuditData found:', JSON.stringify(auditData, null, 2));
  console.log('');

  // Test 2: Check if phone notifications are enabled
  console.log('2. Checking if phone notifications are enabled...');
  const isEnabled = await isAdminAuditPhoneEnabled();
  if (!isEnabled) {
    console.log('   ⚠️  Phone notifications are DISABLED');
    console.log('   💡 Set enabled: true in adminAuditData.phone\n');
  } else {
    console.log('   ✅ Phone notifications are ENABLED');
    console.log('');
  }

  // Test 3: Get phone number
  console.log('3. Getting admin audit phone number...');
  const phoneNumber = await getAdminAuditPhoneNumber();
  if (!phoneNumber) {
    console.log('   ❌ Phone number not configured or disabled');
    console.log('   💡 Make sure phoneNumber is set and enabled: true\n');
    return;
  }
  console.log('   ✅ Phone number:', phoneNumber);
  console.log('');

  // Test 4: Test sending notification (dry run)
  console.log('4. Testing sendAdminAuditNotification function...');
  const testDate = new Date();
  const testDateFormatted = testDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  }) + ' at ' + testDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
  
  console.log('   📝 Test data:');
  console.log('      Customer: Test Customer');
  console.log('      Technician: Test Technician');
  console.log('      Service: Test Service');
  console.log('      Date/Time:', testDateFormatted);
  console.log('      Job ID: 12345');
  console.log('');
  console.log('   (If PODIUM_ENABLED=false, you will see the message in logs below)');
  console.log('');
  
  try {
    const result = await sendAdminAuditNotification(
      'Test Customer',
      'Test Technician',
      'Test Service',
      testDate,
      12345
    );
    
    if (result) {
      console.log('   ✅ Function executed successfully');
      console.log('   📱 Message sent/simulated to:', phoneNumber);
      
      // Show the message that would be sent
      const expectedMessage = [
        `New Virtual Consultation booked:`,
        `Customer: Test Customer`,
        `Technician: Test Technician`,
        `Service: Test Service`,
        `Date/Time: ${testDateFormatted} (Job ID: 12345)`,
      ].join("\n");
      
      console.log('');
      console.log('   📨 Message content:');
      console.log('   ┌─────────────────────────────────────────');
      expectedMessage.split('\n').forEach(line => {
        console.log('   │', line);
      });
      console.log('   └─────────────────────────────────────────');
    } else {
      console.log('   ⚠️  Function returned null');
      console.log('   💡 Check if admin audit is enabled and phone number is configured');
    }
  } catch (error) {
    console.log('   ❌ Error:', error instanceof Error ? error.message : String(error));
    console.log('   Stack:', error instanceof Error ? error.stack : '');
  }
  console.log('');

  console.log('✅ Test completed!');
}

testAdminAudit().catch(console.error);

