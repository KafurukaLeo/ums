/**
 * Module components file: main.ts.
 */
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { initializeDatabase } from './database/connection';
import { errorHandler } from './common/middleware/error.middleware';

// Import all module routers
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import adminRouter from './modules/admin/admin.routes';
import studentsRouter from './modules/students/students.routes';
import lecturersRouter from './modules/lecturers/lecturer.routes';
import coursesRouter from './modules/courses/courses.routes';
import departmentsRouter from './modules/departments/departments.routes';
import enrollmentsRouter from './modules/enrollments/enrollments.routes';
import assignmentsRouter from './modules/assignments/assignments.routes';
import attendanceRouter from './modules/attendance/attendance.routes';
import financeRouter from './modules/finance/finance.routes';
import gradesRouter from './modules/grades/grades.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';

// Load environment variables from .env file
config();

/**
 * Bootstrap function to initialize the application.
 * - Establishes TypeORM connection to the database.
 * - Configures Express app instance.
 * - Mounts global middleware (CORS, body-parser).
 * - Mounts all api module routers.
 * - Installs the global HTTP exception error handler.
 * - Starts the web server listening on configured PORT.
 */
async function bootstrap() {
  // Initialize the database connection pool
  await initializeDatabase();

  const app = express();

  // Enable Cross-Origin Resource Sharing
  app.use(cors());
  
  // Parse incoming JSON request payloads
  app.use(express.json());

  // Mount API modular routers
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/admin', adminRouter);
  app.use('/students', studentsRouter);
  app.use('/lecturers', lecturersRouter);
  app.use('/courses', coursesRouter);
  app.use('/departments', departmentsRouter);
  app.use('/enrollments', enrollmentsRouter);
  app.use('/assignments', assignmentsRouter);
  app.use('/attendance', attendanceRouter);
  app.use('/finance', financeRouter);
  app.use('/grades', gradesRouter);
  app.use('/dashboard', dashboardRouter);

  // Global Express Error Handling Middleware
  app.use(errorHandler);

  // Bind and listen to network port
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
  });
}

// Execute application bootstrap process
bootstrap();