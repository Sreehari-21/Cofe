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
  console.log('=== STARTING COURSE-ASSIGNMENT WORKFLOW UPGRADE TESTS ===');

  try {
    // 1. Health Check
    console.log('\n[TEST 1] Testing Health Check...');
    const health = await request('GET', '/api/health');
    console.log('Health check status:', health.statusCode);
    if (health.statusCode !== 200) throw new Error('Health check failed');

    // 2. Authentication Logins
    console.log('\n[TEST 2] Testing User Logins...');
    
    // Student: Alice Smith
    const student1Login = await request('POST', '/api/auth/login', {
      email: 'student1@university.edu',
      password: 'password123'
    });
    console.log('Student 1 Login status:', student1Login.statusCode);
    if (student1Login.statusCode !== 200) throw new Error('Student 1 login failed');
    const student1Token = student1Login.data.token;

    // Student: Charlie Brown (Math student)
    const student3Login = await request('POST', '/api/auth/login', {
      email: 'student3@university.edu',
      password: 'password123'
    });
    console.log('Student 3 Login status:', student3Login.statusCode);
    if (student3Login.statusCode !== 200) throw new Error('Student 3 login failed');
    const student3Token = student3Login.data.token;

    // Faculty 1: Dr. Alan Turing
    const faculty1Login = await request('POST', '/api/auth/login', {
      email: 'faculty1@university.edu',
      password: 'password123'
    });
    console.log('Faculty 1 Login status:', faculty1Login.statusCode);
    if (faculty1Login.statusCode !== 200) throw new Error('Faculty 1 login failed');
    const faculty1Token = faculty1Login.data.token;

    // Faculty 2: Dr. Ada Lovelace
    const faculty2Login = await request('POST', '/api/auth/login', {
      email: 'faculty2@university.edu',
      password: 'password123'
    });
    console.log('Faculty 2 Login status:', faculty2Login.statusCode);
    if (faculty2Login.statusCode !== 200) throw new Error('Faculty 2 login failed');
    const faculty2Token = faculty2Login.data.token;

    // Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@university.edu',
      password: 'password123'
    });
    console.log('Admin Login status:', adminLogin.statusCode);
    if (adminLogin.statusCode !== 200) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;

    // 3. Authorization Block Rules
    console.log('\n[TEST 3] Testing Authorization (Student accessing Admin stats)...');
    const adminStatsFail = await request('GET', '/api/admin/statistics', null, {
      'Authorization': `Bearer ${student1Token}`
    });
    console.log('Student access stats status (expected 403):', adminStatsFail.statusCode);
    if (adminStatsFail.statusCode !== 403) throw new Error('Role authorization bypass detected!');

    // 4. Course Creation (Faculty 1 creates Course)
    console.log('\n[TEST 4] Testing Faculty Course Creation...');
    const courseRes = await request('POST', '/api/courses', {
      courseName: 'Compiler Design',
      courseCode: '21CS55',
      description: 'Design and construction of compilers.',
      department: 'Computer Science',
      semester: '5th Semester',
      academicYear: '2026-2027'
    }, {
      'Authorization': `Bearer ${faculty1Token}`
    });
    console.log('Create Course status (expected 201):', courseRes.statusCode);
    if (courseRes.statusCode !== 201) throw new Error('Course creation failed');
    const courseId = courseRes.data.data._id;
    const refKey = courseRes.data.data.referenceKey;
    console.log(`Generated Reference Key: ${refKey}`);
    if (!refKey) throw new Error('Reference Key was not generated!');

    // 5. Course Creation Duplicate Block Check
    console.log('\n[TEST 5] Testing Course Code Uniqueness (Duplicate Code)...');
    const duplicateRes = await request('POST', '/api/courses', {
      courseName: 'Compiler Construction',
      courseCode: '21CS55', // Duplicate code!
      description: 'Another compiler course.',
      department: 'Computer Science',
      semester: '5th Semester',
      academicYear: '2026-2027'
    }, {
      'Authorization': `Bearer ${faculty2Token}`
    });
    console.log('Duplicate Course status (expected 400):', duplicateRes.statusCode);
    if (duplicateRes.statusCode !== 400) throw new Error('Duplicate course code allowed!');

    // 6. Student Joining Course using key
    console.log('\n[TEST 6] Testing Student Joining Course via Reference Key...');
    const joinRes = await request('POST', '/api/courses/join', {
      referenceKey: refKey
    }, {
      'Authorization': `Bearer ${student1Token}`
    });
    console.log('Join Course status (expected 200):', joinRes.statusCode);
    if (joinRes.statusCode !== 200) throw new Error('Student joining course failed');

    // 7. Student Joining same course twice (duplicate enrollment block check)
    console.log('\n[TEST 7] Testing Student Joining Course Twice (Expected Block)...');
    const joinRes2 = await request('POST', '/api/courses/join', {
      referenceKey: refKey
    }, {
      'Authorization': `Bearer ${student1Token}`
    });
    console.log('Join Course status (expected 400):', joinRes2.statusCode);
    if (joinRes2.statusCode !== 400) throw new Error('Student was able to join course twice!');

    // 8. Student Joining with invalid key
    console.log('\n[TEST 8] Testing Joining with Invalid Reference Key...');
    const joinResFail = await request('POST', '/api/courses/join', {
      referenceKey: 'INVALID-KEY'
    }, {
      'Authorization': `Bearer ${student1Token}`
    });
    console.log('Join Course status (expected 404):', joinResFail.statusCode);
    if (joinResFail.statusCode !== 404) throw new Error('Invalid key accepted!');

    // 9. Faculty Creates Assignment inside Course
    console.log('\n[TEST 9] Testing Assignment Creation inside Course...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    const assignRes = await request('POST', `/api/courses/${courseId}/projects`, {
      title: 'Parser Design',
      description: 'Write a recursive descent parser for subset of Javascript.',
      technologies: ['C++', 'Lex', 'Yacc'],
      deadline: futureDate,
      allowLateSubmission: false
    }, {
      'Authorization': `Bearer ${faculty1Token}`
    });
    console.log('Create Assignment status (expected 201):', assignRes.statusCode);
    if (assignRes.statusCode !== 201) throw new Error('Assignment creation failed');
    const assignmentId = assignRes.data.data._id;

    // 10. Cross Faculty Assignment Creation Block (Ada Lovelace trying to create assignment in Compiler course owned by Alan Turing)
    console.log('\n[TEST 10] Testing Cross Faculty Assignment Creation Block...');
    const crossAssignRes = await request('POST', `/api/courses/${courseId}/projects`, {
      title: 'Ada Grammar Parser',
      description: 'Write a parser.',
      technologies: ['Ada'],
      deadline: futureDate
    }, {
      'Authorization': `Bearer ${faculty2Token}`
    });
    console.log('Cross assignment status (expected 403):', crossAssignRes.statusCode);
    if (crossAssignRes.statusCode !== 403) throw new Error('Faculty could create assignment in another faculty\'s course!');

    // 11. Student sees enrolled-course assignment
    console.log('\n[TEST 11] Testing Student Accessing Enrolled Assignment...');
    const viewAssignRes = await request('GET', `/api/projects/${assignmentId}`, null, {
      'Authorization': `Bearer ${student1Token}`
    });
    console.log('View assignment status (expected 200):', viewAssignRes.statusCode);
    if (viewAssignRes.statusCode !== 200) throw new Error('Enrolled student blocked from viewing assignment');

    // Retrieve the Math assignment by querying as Charlie (student 3) who is enrolled
    const charlieProjects = await request('GET', '/api/projects', null, {
      'Authorization': `Bearer ${student3Token}`
    });
    
    const mathAssignment = charlieProjects.data.data.find(p => p.title === 'Blockchain Ledger');
    if (!mathAssignment) {
      throw new Error('Blockchain Ledger math assignment was not found in seeded list for Charlie!');
    }
    
    console.log(`Found Math Assignment: ${mathAssignment._id}. Querying detail as Alice (student1)...`);
    const viewMathRes = await request('GET', `/api/projects/${mathAssignment._id}`, null, {
      'Authorization': `Bearer ${student1Token}`
    });
    
    console.log('Access math assignment status (expected 403):', viewMathRes.statusCode);
    if (viewMathRes.statusCode !== 403) {
      throw new Error('Unenrolled student was able to access assignments of another course by ID!');
    }
    console.log('Cross-course assignment access block passed (403 received)');

    // 13. Admin statistics verification (verify totalCourses and totalSubmissions)
    console.log('\n[TEST 13] Testing Admin Statistics counts...');
    const statsRes = await request('GET', '/api/admin/statistics', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log('Admin stats status (expected 200):', statsRes.statusCode);
    if (statsRes.statusCode !== 200) throw new Error('Admin stats fetch failed');
    console.log('Admin statistics fields retrieved:', Object.keys(statsRes.data.data));
    if (statsRes.data.data.totalCourses === undefined || statsRes.data.data.totalSubmissions === undefined) {
      throw new Error('Stats properties totalCourses or totalSubmissions are missing!');
    }
    console.log(`Stats - Courses: ${statsRes.data.data.totalCourses}, Submissions: ${statsRes.data.data.totalSubmissions}`);

    console.log('\n=== ALL COURSE-ASSIGNMENT WORKFLOW UPGRADE TESTS PASSED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n!!! TEST FAILURE:', error.message);
    process.exit(1);
  }
};

runTests();
