const http = require('http');

const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5050,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('=== STARTING API TESTS ===');

  try {
    console.log('Testing Health Check...');
    const health = await request('GET', '/api/health');
    console.log('Health check response status:', health.statusCode);
    if (health.statusCode !== 200) throw new Error('Health check failed');

    console.log('\nTesting Login for Alice Smith (student)...');
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student1@university.edu',
      password: 'password123'
    });
    console.log('Login status:', studentLogin.statusCode);
    if (studentLogin.statusCode !== 200) throw new Error('Student login failed');
    const studentToken = studentLogin.data.token;

    console.log('\nTesting profile GET /api/auth/me...');
    const me = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${studentToken}`
    });
    console.log('Profile status:', me.statusCode);
    console.log('Logged in user:', me.data.user.name);
    if (me.data.user.role !== 'student') throw new Error('Profile role mismatch');

    console.log('\nTesting Role Authorization (Student accessing Admin route)...');
    const adminStatsFail = await request('GET', '/api/admin/statistics', null, {
      'Authorization': `Bearer ${studentToken}`
    });
    console.log('Access stats status (expected 403):', adminStatsFail.statusCode);
    if (adminStatsFail.statusCode !== 403) throw new Error('Role authorization bypass detected!');
    console.log('Authorization check passed (403 Forbidden received)');

    console.log('\nTesting Login for Admin...');
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@university.edu',
      password: 'password123'
    });
    console.log('Admin login status:', adminLogin.statusCode);
    if (adminLogin.statusCode !== 200) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;

    console.log('\nTesting Admin accessing Admin stats...');
    const adminStatsSuccess = await request('GET', '/api/admin/statistics', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Admin stats status (expected 200):', adminStatsSuccess.statusCode);
    console.log('Stats data:', adminStatsSuccess.data.data);
    if (adminStatsSuccess.statusCode !== 200) throw new Error('Admin statistics fetch failed');

    console.log('\n=== ALL PORTAL SECURITY & AUTH TESTS PASSED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! TEST FAILURE:', error.message);
    process.exit(1);
  }
};

runTests();
