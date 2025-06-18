// Simple test script to verify backend integration
// Run with: node test-integration.js

const API_BASE_URL = 'http://localhost:5000';

async function testBackendConnection() {
  console.log('🧪 Testing Travel Alert Backend Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('   Agent ready:', healthData.agent_ready);
    console.log('   Timestamp:', healthData.timestamp);
    console.log('');

    // Test 2: Status Check
    console.log('2️⃣ Testing status endpoint...');
    const statusResponse = await fetch(`${API_BASE_URL}/api/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status check:');
    console.log('   Running:', statusData.is_running);
    console.log('   Total records:', statusData.total_records);
    console.log('   Last run:', statusData.last_run || 'Never');
    console.log('');

    // Test 3: Files Check
    console.log('3️⃣ Testing files endpoint...');
    const filesResponse = await fetch(`${API_BASE_URL}/api/files`);
    const filesData = await filesResponse.json();
    console.log('✅ Files check:');
    console.log('   Available files:', filesData.files.length);
    if (filesData.files.length > 0) {
      console.log('   Latest file:', filesData.files[0].filename);
      console.log('   Records:', filesData.files[0].records);
    }
    console.log('');

    // Test 4: API Connections
    console.log('4️⃣ Testing external API connections...');
    
    try {
      const eventbriteResponse = await fetch(`${API_BASE_URL}/api/eventbrite/test`);
      const eventbriteData = await eventbriteResponse.json();
      console.log('   🎫 Eventbrite:', eventbriteData.connected ? '✅ Connected' : '❌ Disconnected');
    } catch (e) {
      console.log('   🎫 Eventbrite: ❌ Error testing connection');
    }

    try {
      const gnewsResponse = await fetch(`${API_BASE_URL}/api/gnews/test`);
      const gnewsData = await gnewsResponse.json();
      console.log('   📰 GNews:', gnewsData.connected ? '✅ Connected' : '❌ Disconnected');
    } catch (e) {
      console.log('   📰 GNews: ❌ Error testing connection');
    }

    console.log('\n🎉 Backend integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create .env file with: VITE_API_URL=http://localhost:5000');
    console.log('   2. Start frontend with: npm run dev');
    console.log('   3. Navigate to Alerts page and test the Agent Control tab');

  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running: python api_server.py');
    console.log('   2. Check if port 5000 is available');
    console.log('   3. Verify backend .env file has API keys');
  }
}

// Run the test
testBackendConnection(); 