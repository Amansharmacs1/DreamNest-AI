import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- STARTING SYSTEM INTEGRATION TEST ---');
  let token = '';
  let projectId = '';
  let shareToken = '';
  const testEmail = `test_${Date.now()}@dreamnest.ai`;
  const testPassword = 'password123';

  // 1. Test Authentication (Register)
  try {
    console.log(`\n1. Testing User Registration (${testEmail})...`);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      name: 'System Tester'
    });
    token = regRes.data.token;
    console.log('✅ Registration successful. Token received.');
  } catch (error: any) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return;
  }

  // 2. Test Authentication (Login)
  try {
    console.log('\n2. Testing User Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    if (loginRes.data.token) {
      console.log('✅ Login successful.');
    } else {
      throw new Error('No token returned on login');
    }
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return;
  }

  // 3. Test Authentication (Get Me)
  try {
    console.log('\n3. Testing Protected Route (/auth/me)...');
    const meRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Fetched profile successfully: ${meRes.data.user.name}`);
  } catch (error: any) {
    console.error('❌ Fetching profile failed:', error.response?.data || error.message);
    return;
  }

  // 4. Test Project Creation
  try {
    console.log('\n4. Testing Cloud Project Creation...');
    const projectPayload = {
      name: 'Integration Test Villa',
      plotDimensions: { width: 50, length: 100, unit: 'Feet' },
      usableArea: { width: 50, length: 100, startX: 0, startY: 0 },
      preferences: { style: 'Modern', bedrooms: 3, floors: 2 },
      rooms: [
        { id: '1', name: 'Living Room', floor: 0, x: 0, y: 0, width: 20, length: 20 }
      ],
      analysis: { energyScore: 85 }
    };

    const projRes = await axios.post(`${API_URL}/projects`, projectPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    projectId = projRes.data._id;
    console.log(`✅ Project created successfully. ID: ${projectId}`);
  } catch (error: any) {
    console.error('❌ Project creation failed:', error.response?.data || error.message);
    return;
  }

  // 5. Test Fetching Projects (Dashboard Data)
  try {
    console.log('\n5. Testing Fetching User Projects...');
    const listRes = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (listRes.data.length > 0) {
      console.log(`✅ Fetched ${listRes.data.length} projects successfully.`);
    } else {
      throw new Error('Project list is empty after creation');
    }
  } catch (error: any) {
    console.error('❌ Fetching projects failed:', error.response?.data || error.message);
    return;
  }

  // 6. Test Generating Share Link
  try {
    console.log('\n6. Testing Generating Share Link...');
    const shareRes = await axios.post(`${API_URL}/projects/${projectId}/share`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    shareToken = shareRes.data.shareToken;
    console.log(`✅ Share link generated successfully. Token: ${shareToken}`);
  } catch (error: any) {
    console.error('❌ Share link generation failed:', error.response?.data || error.message);
    return;
  }

  // 7. Test Public Access to Shared Project
  try {
    console.log('\n7. Testing Public Access to Shared Project...');
    const publicRes = await axios.get(`${API_URL}/projects/shared/${shareToken}`);
    if (publicRes.data.name === 'Integration Test Villa') {
      console.log('✅ Public access successful.');
    } else {
      throw new Error('Public access returned incorrect data');
    }
  } catch (error: any) {
    console.error('❌ Public access failed:', error.response?.data || error.message);
    return;
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  process.exit(0);
}

runTests();
