const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const dbUrl = "postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university";
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log("Cleaning up existing database tables...");
  await client.query('TRUNCATE TABLE "assignment_submissions", "assignments", "grades", "attendance", "enrollments", "courses", "students", "lecturers", "users" RESTART IDENTITY CASCADE;');

  console.log("Hashing passwords...");
  const adminPassword = bcrypt.hashSync("admin123", 10);
  const studentPassword = bcrypt.hashSync("password123", 10);
  const lecturerPassword = bcrypt.hashSync("password123", 10);

  console.log("Inserting users...");
  const userResults = await client.query(`
    INSERT INTO users (name, email, role, password, "isEmailVerified") VALUES
    ('Admin User', 'admin@university.com', 'admin', $1, true),
    ('Simplified Student', 'student_simplified_1@example.com', 'student', $2, true),
    ('Alice Smith', 'alice@example.com', 'student', $2, true),
    ('Bob Jones', 'bob@example.com', 'student', $2, true),
    ('Dr. Charles Xavier', 'lecturer_charles@example.com', 'lecturer', $3, true),
    ('Prof. Jane Smith', 'lecturer_jane@example.com', 'lecturer', $3, true),
    ('Kafuruka Leo', 'kafurukaleo1992@gmail.com', 'student', $2, true)
    RETURNING id, email;
  `, [adminPassword, studentPassword, lecturerPassword]);

  console.log("Inserting students...");
  const studentResults = await client.query(`
    INSERT INTO students (name, email, program, department, country) VALUES
    ('Simplified Student', 'student_simplified_1@example.com', 'BSc Computer Science', 'Computer Science', 'Rwanda'),
    ('Alice Smith', 'alice@example.com', 'BSc Computer Science', 'Computer Science', 'Rwanda'),
    ('Bob Jones', 'bob@example.com', 'BSc Computer Science', 'Computer Science', 'Rwanda'),
    ('Kafuruka Leo', 'kafurukaleo1992@gmail.com', 'BSc Computer Science', 'Computer Science', 'Rwanda')
    RETURNING id, email;
  `);

  const studentMap = {};
  studentResults.rows.forEach(s => {
    studentMap[s.email] = s.id;
  });

  console.log("Inserting lecturers...");
  const lecturerResults = await client.query(`
    INSERT INTO lecturers (name, email) VALUES
    ('Dr. Charles Xavier', 'lecturer_charles@example.com'),
    ('Prof. Jane Smith', 'lecturer_jane@example.com')
    RETURNING id, email;
  `);

  const lecturerMap = {};
  lecturerResults.rows.forEach(l => {
    lecturerMap[l.email] = l.id;
  });

  console.log("Inserting courses...");
  const courseResults = await client.query(`
    INSERT INTO courses (name, code, "lecturerId", timetable) VALUES
    ('Introduction to Computer Science', 'CS101', $1, 'Mon 9:00 AM'),
    ('Calculus II', 'MATH201', $2, 'Wed 2:00 PM')
    RETURNING id, code;
  `, [lecturerMap['lecturer_charles@example.com'], lecturerMap['lecturer_jane@example.com']]);

  const courseMap = {};
  courseResults.rows.forEach(c => {
    courseMap[c.code] = c.id;
  });

  console.log("Inserting enrollments...");
  const enrollmentResults = await client.query(`
    INSERT INTO enrollments ("studentId", "courseId") VALUES
    ($1, $5), -- Alice in CS101
    ($1, $6), -- Alice in MATH201
    ($2, $5), -- Bob in CS101
    ($3, $5), -- Student 1 in CS101
    ($4, $5), -- Kafuruka Leo in CS101
    ($4, $6)  -- Kafuruka Leo in MATH201
    RETURNING id, "studentId", "courseId";
  `, [
    studentMap['alice@example.com'],
    studentMap['bob@example.com'],
    studentMap['student_simplified_1@example.com'],
    studentMap['kafurukaleo1992@gmail.com'],
    courseMap['CS101'],
    courseMap['MATH201']
  ]);

  const enrollmentMap = {};
  enrollmentResults.rows.forEach(e => {
    enrollmentMap[e.studentId + '-' + e.courseId] = e.id;
  });

  console.log("Inserting attendance...");
  const today = new Date();
  await client.query(`
    INSERT INTO attendance ("enrollmentId", date, status) VALUES
    ($1, $7, 'present'), -- Alice CS101
    ($2, $7, 'present'), -- Alice MATH201
    ($3, $7, 'absent'),  -- Bob CS101
    ($4, $7, 'present'), -- Student 1 CS101
    ($5, $7, 'present'), -- Kafuruka Leo CS101
    ($6, $7, 'present')  -- Kafuruka Leo MATH201
  `, [
    enrollmentMap[studentMap['alice@example.com'] + '-' + courseMap['CS101']],
    enrollmentMap[studentMap['alice@example.com'] + '-' + courseMap['MATH201']],
    enrollmentMap[studentMap['bob@example.com'] + '-' + courseMap['CS101']],
    enrollmentMap[studentMap['student_simplified_1@example.com'] + '-' + courseMap['CS101']],
    enrollmentMap[studentMap['kafurukaleo1992@gmail.com'] + '-' + courseMap['CS101']],
    enrollmentMap[studentMap['kafurukaleo1992@gmail.com'] + '-' + courseMap['MATH201']],
    today
  ]);

  console.log("Inserting assignments...");
  const assignmentResults = await client.query(`
    INSERT INTO assignments (title, description, "courseId", "lecturerId", "dueDate") VALUES
    ('Assignment 1: TypeScript Basics', 'Create a simple project using TypeScript and Node.js.', $1, $2, $3)
    RETURNING id;
  `, [
    courseMap['CS101'],
    lecturerMap['lecturer_charles@example.com'],
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ]);

  const assignmentId = assignmentResults.rows[0].id;

  console.log("Inserting assignment submissions...");
  await client.query(`
    INSERT INTO assignment_submissions ("assignmentId", "studentId", "submissionText", grade, feedback) VALUES
    ($1, $2, 'https://github.com/alice/ts-basics-submission', 95.5, 'Excellent work on formatting and type safety!')
  `, [assignmentId, studentMap['alice@example.com']]);

  console.log("Database seeded successfully!");
  await client.end();
}

seed().catch(err => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
