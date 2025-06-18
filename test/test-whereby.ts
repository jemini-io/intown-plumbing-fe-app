#!/usr/bin/env tsx

import {
  createConsultationMeeting,
  getMeeting,
  deleteMeeting,
} from "../lib/whereby";

async function testWherebyIntegration() {
  console.log("🧪 Testing Whereby Integration...\n");

  const testCustomerName = "Test Customer";
  const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
  const endTime = new Date(
    Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000
  ).toISOString(); // Tomorrow + 30 min

  let meetingId: string | null = null;

  try {
    // Test 1: Create a meeting
    console.log("📅 Creating test meeting...");
    const meeting = await createConsultationMeeting(
      startTime,
      endTime,
      testCustomerName
    );
    meetingId = meeting.meetingId;

    console.log("✅ Meeting created successfully!");
    console.log(`   Meeting ID: ${meeting.meetingId}`);
    console.log(`   Room URL: ${meeting.roomUrl}`);
    console.log(`   Host Room URL: ${meeting.hostRoomUrl}`);
    console.log(`   Room Name: ${meeting.roomName}`);
    console.log(`   Start: ${meeting.startDate}`);
    console.log(`   End: ${meeting.endDate}\n`);

    // Test 2: Get the meeting
    console.log("🔍 Fetching meeting details...");
    const fetchedMeeting = await getMeeting(meeting.meetingId);

    console.log("✅ Meeting fetched successfully!");
    console.log(`   Meeting ID: ${fetchedMeeting.meetingId}`);
    console.log(`   Room Name: ${fetchedMeeting.roomName}\n`);

    // Test 3: Delete the meeting
    console.log("🗑️  Cleaning up - deleting test meeting...");
    await deleteMeeting(meeting.meetingId);

    console.log("✅ Meeting deleted successfully!\n");

    console.log(
      "🎉 All tests passed! Whereby integration is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);

    // Try to clean up if we created a meeting
    if (meetingId) {
      console.log("🧹 Attempting to clean up created meeting...");
      try {
        await deleteMeeting(meetingId);
        console.log("✅ Cleanup successful");
      } catch (cleanupError) {
        console.error("❌ Cleanup failed:", cleanupError);
      }
    }

    process.exit(1);
  }
}

// Run the test
testWherebyIntegration().catch(console.error);
