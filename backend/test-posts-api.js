import fetch from 'node-fetch';

// Test script to verify the /api/posts endpoint is working
async function testPostsEndpoint() {
  try {
    console.log('Testing /api/posts endpoint...\n');
    
    // First, get a valid token by logging in
    const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with actual test user
        password: 'test123' // Replace with actual password
      })
    });
    
    if (!loginResponse.ok) {
      console.log('⚠️  Login failed. Please update test credentials in test-posts-api.js');
      console.log('   Or test manually by logging into http://localhost:5173/login\n');
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Test the posts endpoint
    const postsResponse = await fetch('http://localhost:8000/api/posts?page=1&limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const postsData = await postsResponse.json();
    
    if (postsResponse.ok && postsData.success) {
      console.log('✅ SUCCESS! /api/posts endpoint is working correctly');
      console.log(`   Status: ${postsResponse.status}`);
      console.log(`   Posts returned: ${postsData.data?.length || 0}`);
      console.log(`   Pagination: page ${postsData.pagination?.page}, total ${postsData.pagination?.total}`);
      console.log('\n✅ Social feed is now loading successfully!\n');
    } else {
      console.log('❌ FAILED! Response:', postsData);
    }
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
  }
}

testPostsEndpoint();
