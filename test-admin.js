const http = require('http');

async function request(path, options = {}) {
  const method = options.method || 'GET';
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const body = options.body;

  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      { method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function logTestResult(name, success, details = '', resBody = null) {
  if (success) {
    console.log(`✅ [PASS] ${name} ${details}`);
  } else {
    console.error(`❌ [FAIL] ${name} - ${details}`);
    if (resBody) console.error(resBody);
  }
}

async function runAdminTests() {
  console.log("=== STARTING ADMIN ROLE TESTS ===");

  // 1. Login as Admin
  console.log("\nLogging in as Admin...");
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@university.com', password: 'admin123' })
  });
  
  const adminToken = loginRes.body.accessToken;
  logTestResult('Admin Login', loginRes.status === 201 && adminToken, `Status: ${loginRes.status}`);

  if (!adminToken) {
    console.log("Could not get admin token, aborting tests.");
    return;
  }

  const authHeaders = { Authorization: `Bearer ${adminToken}` };

  // 2. Test Get Users (Admin only)
  const usersRes = await request('/users', { headers: authHeaders });
  logTestResult('GET /users (Admin Access)', usersRes.status === 200, `Status: ${usersRes.status}`);

  // 3. Test Get Students (Admin/Lecturer)
  const studentsRes = await request('/students', { headers: authHeaders });
  logTestResult('GET /students (Admin Access)', studentsRes.status === 200, `Status: ${studentsRes.status}`);

  // 4. Test Create Course (Admin only)
  const rand = Math.floor(Math.random() * 10000);
  const courseRes = await request('/courses', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: `CS${rand}`,
      name: `Test Admin Course ${rand}`,
      description: 'Created by Admin Test Script',
      credits: 3,
      department: 'Computer Science'
    })
  });
  logTestResult('POST /courses (Admin Creation)', courseRes.status === 201, `Status: ${courseRes.status}`, courseRes.body);

  // 5. Test Get Student ID 10 (Admin override access)
  // Even though it might return 404 if 10 doesn't exist, it should NOT return 403 Forbidden
  const student10Res = await request('/students/10', { headers: authHeaders });
  logTestResult('GET /students/10 (Admin Bypass)', student10Res.status === 200 || student10Res.status === 404, `Status: ${student10Res.status}`, student10Res.body);

  // 6. Test Finance Fee Structures (Admin only)
  const feeRes = await request('/finance/fee-structures', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      program: 'Computer Science',
      academicYear: 2026,
      semester: 1,
      totalAmount: 1500
    })
  });
  logTestResult('POST /finance/fee-structures (Admin Creation)', feeRes.status === 201, `Status: ${feeRes.status}`, feeRes.body);

  console.log("\n=== ADMIN TESTS COMPLETE ===");
}

runAdminTests().catch(console.error);
