// Using native global fetch (Node.js 18+)
const { execSync } = require('child_process');

const BASE_URL = 'http://localhost:3000';

// Global tokens
let adminToken = '';
let lecturerToken = '';
let studentToken = '';

// Helper for HTTP requests
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const status = response.status;
  let body = null;
  try {
    body = await response.json();
  } catch (err) {
    // If not JSON
  }
  return { status, body };
}

// Log test cases beautifully
function logTestResult(name, success, info = '', body = null) {
  const marker = success ? '✅ PASS' : '❌ FAIL';
  let bodyStr = '';
  if (!success && body) {
    bodyStr = ` | Response: ${JSON.stringify(body)}`;
  }
  console.log(`${marker} - ${name} ${info ? `(${info})` : ''}${bodyStr}`);
}

async function runAllTests() {
  console.log('==================================================');
  console.log('STARTING ALL ENDPOINTS INTEGRATION TEST');
  console.log('==================================================\n');

  // Step 1: Seed the database to a clean, known state
  console.log('Resetting and seeding database...');
  try {
    execSync('node seed.js', { stdio: 'inherit' });
    logTestResult('Database Reset & Seed', true);
  } catch (err) {
    logTestResult('Database Reset & Seed', false, err.message);
    process.exit(1);
  }
  console.log();

  // Step 2: Authentication & Token Retrieval
  console.log('--- 1. AUTHENTICATION & RBAC LOGINS ---');
  
  // Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@university.com', password: 'admin123' })
  });
  if (adminLogin.status === 201 && adminLogin.body.accessToken) {
    adminToken = adminLogin.body.accessToken;
    logTestResult('Admin Authentication', true);
  } else {
    logTestResult('Admin Authentication', false, `Status ${adminLogin.status}`);
  }

  // Lecturer Login
  const lecturerLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'lecturer_charles@example.com', password: 'password123' })
  });
  if (lecturerLogin.status === 201 && lecturerLogin.body.accessToken) {
    lecturerToken = lecturerLogin.body.accessToken;
    logTestResult('Lecturer Authentication', true);
  } else {
    logTestResult('Lecturer Authentication', false, `Status ${lecturerLogin.status}`);
  }

  // Student Login
  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alice@example.com', password: 'password123' })
  });
  if (studentLogin.status === 201 && studentLogin.body.accessToken) {
    studentToken = studentLogin.body.accessToken;
    logTestResult('Student Authentication', true);
  } else {
    logTestResult('Student Authentication', false, `Status ${studentLogin.status}`);
  }
  console.log();

  // Step 3: Users Module
  console.log('--- 2. USERS ENDPOINTS ---');
  
  // Admin list all users (Allowed)
  const getUsersAdmin = await request('/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  logTestResult('Admin Get Users list', getUsersAdmin.status === 200 && getUsersAdmin.body.length > 0);

  // Student list all users (Should be Forbidden)
  const getUsersStudent = await request('/users', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student Get Users list (Blocked)', getUsersStudent.status === 403, 'Expected 403');
  console.log();

  // Step 4: Students Module
  console.log('--- 3. STUDENTS ENDPOINTS ---');
  
  // Register a student profile unauthenticated (Should succeed if email is clean)
  const registerStudent = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john.doe@university.ac.rw',
      password: 'password123',
      village: 'Kimironko',
      country: 'Rwanda',
      program: 'Computer Science',
      department: 'Computer Science'
    })
  });
  logTestResult('Guest Student Registration', registerStudent.status === 201, `Status ${registerStudent.status}`);

  // Fetch student profile as Admin
  const getStudentAdmin = await request('/students/2', { // Alice ID is 2 (seeded)
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  logTestResult('Admin Fetch Student Profile by ID', getStudentAdmin.status === 200 && getStudentAdmin.body.email === 'alice@example.com');

  // Fetch own transcript as Student
  const getTranscript = await request('/students/2/transcript', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student Fetch Own Transcript', getTranscript.status === 200);

  // Fetch own exam-card as Student
  const getExamCard = await request('/students/2/exam-card', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student Fetch Own Exam Card', getExamCard.status === 200);

  // Fetch own cat-card as Student
  const getCatCard = await request('/students/2/cat-card', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student Fetch Own CAT Card', getCatCard.status === 200);

  // Try fetching someone else's exam-card (Should be Forbidden)
  const getExamCardOther = await request('/students/1/exam-card', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student Fetching Other\'s Exam Card (Blocked)', getExamCardOther.status === 403, 'Expected 403');
  console.log();

  // Step 5: Lecturers Module
  console.log('--- 4. LECTURERS ENDPOINTS ---');

  // Admin get lecturers list
  const getLecturers = await request('/lecturers', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  logTestResult('Admin Fetch Lecturers List', getLecturers.status === 200 && getLecturers.body.length > 0);

  // Lecturer view their own assigned courses
  const getLecturerCourses = await request('/lecturers/1/courses', { // Dr. Charles is ID 1
    headers: { Authorization: `Bearer ${lecturerToken}` }
  });
  logTestResult('Lecturer Fetch Assigned Courses', getLecturerCourses.status === 200);
  console.log();

  // Step 6: Courses Module
  console.log('--- 5. COURSES ENDPOINTS ---');

  // Admin get all courses
  const getCourses = await request('/courses', {
    headers: { Authorization: `Bearer ${studentToken}` } // Students can view courses too
  });
  logTestResult('Fetch Courses List', getCourses.status === 200 && getCourses.body.length > 0);

  // Admin Create a new course
  const createCourse = await request('/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'Software Engineering',
      code: 'CS302',
      lecturerId: 1,
      timetable: 'Tue 10:00 AM'
    })
  });
  logTestResult('Admin Create New Course', createCourse.status === 201, `Status ${createCourse.status}`);
  console.log();

  // Step 7: Enrollments Module
  console.log('--- 6. ENROLLMENTS ENDPOINTS ---');

  // Student enrolls in the newly created course
  const newCourseId = createCourse.body?.id || 3;
  const studentEnroll = await request('/enrollments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      studentId: 2, // Alice
      courseId: newCourseId
    })
  });
  logTestResult('Student Enroll in Course', studentEnroll.status === 201);

  // Admin get enrollments
  const getEnrollments = await request('/enrollments', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  logTestResult('Admin Fetch All Enrollments', getEnrollments.status === 200 && getEnrollments.body.length > 0);
  console.log();

  // Step 8: Assignments Module
  console.log('--- 7. ASSIGNMENTS ENDPOINTS ---');

  // Lecturer create assignment
  const createAssignment = await request('/assignments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lecturerToken}` },
    body: JSON.stringify({
      title: 'Practical Project 1',
      description: 'Implement a REST API.',
      courseId: 1, // CS101
      lecturerId: 1,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    })
  });
  logTestResult('Lecturer Create Assignment', createAssignment.status === 201, `Status ${createAssignment.status}`, createAssignment.body);

  // Student submit assignment
  const assignmentId = createAssignment.body?.id || 2;
  const submitAssignment = await request(`/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      studentId: 2,
      submissionText: 'https://github.com/alice/project1'
    })
  });
  logTestResult('Student Submit Assignment', submitAssignment.status === 201, `Status ${submitAssignment.status}`, submitAssignment.body);

  // Lecturer view submissions
  const getSubmissions = await request(`/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${lecturerToken}` }
  });
  logTestResult('Lecturer Fetch Submissions', getSubmissions.status === 200 && getSubmissions.body.length > 0, `Status ${getSubmissions.status}`, getSubmissions.body);

  // Lecturer grade submission
  const submissionId = getSubmissions.body?.[0]?.id || 2;
  const gradeSubmission = await request(`/assignments/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${lecturerToken}` },
    body: JSON.stringify({
      grade: 92.5,
      feedback: 'Great effort on integration structure.'
    })
  });
  logTestResult('Lecturer Grade Assignment Submission', gradeSubmission.status === 200 && gradeSubmission.body.grade === 92.5, `Status ${gradeSubmission.status}`, gradeSubmission.body);
  console.log();

  // Step 9: Attendance Module
  console.log('--- 8. ATTENDANCE ENDPOINTS ---');

  // Lecturer create attendance record
  const recordAttendance = await request('/attendance', {
    method: 'POST',
    headers: { Authorization: `Bearer ${lecturerToken}` },
    body: JSON.stringify({
      enrollmentId: 1, // Alice CS101 enrollment
      date: new Date().toISOString().split('T')[0],
      status: 'present'
    })
  });
  logTestResult('Lecturer Record Attendance', recordAttendance.status === 201);

  // Lecturer view attendance list
  const getAttendance = await request('/attendance', {
    headers: { Authorization: `Bearer ${lecturerToken}` }
  });
  logTestResult('Lecturer Fetch Attendance List', getAttendance.status === 200 && getAttendance.body.length > 0);
  console.log();

  // Step 10: Finance Module
  console.log('--- 9. FINANCE ENDPOINTS ---');

  // Admin configure fee structure
  const configureFee = await request('/finance/fee-structures', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      program: 'BSc Computer Science',
      academicYear: 2026,
      semester: 1,
      totalAmount: 1000.00
    })
  });
  logTestResult('Admin Configure Fee Structure', configureFee.status === 201, `Status ${configureFee.status}`, configureFee.body);

  // Student view fee balance
  const getBalance = await request('/finance/students/2/balance', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  logTestResult('Student View Balance & Clearance', getBalance.status === 200 && getBalance.body.outstandingBalance !== undefined, `Status ${getBalance.status}`, getBalance.body);

  // Student post tuition payment
  const postPayment = await request('/finance/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      studentId: 2,
      amountPaid: 500.00,
      academicYear: 2026,
      semester: 1
    })
  });
  logTestResult('Student Post Tuition Payment', postPayment.status === 201, `Status ${postPayment.status}`, postPayment.body);

  // Admin view financial report statements
  const getStatements = await request('/finance/reports/statements', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  logTestResult('Admin Fetch Financial Statements', getStatements.status === 200 && getStatements.body.totalFeesCollected !== undefined, `Status ${getStatements.status}`, getStatements.body);
  console.log();

  console.log('==================================================');
  console.log('ALL ENDPOINTS INTEGRATION TEST COMPLETED SUCCESSFULLY');
  console.log('==================================================');
}

runAllTests().catch(err => {
  console.error('Integration test failed with error:', err);
  process.exit(1);
});
