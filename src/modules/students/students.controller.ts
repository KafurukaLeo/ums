import { Response } from 'express';
import { studentsService } from './students.service';
import { enrollmentsService } from '../enrollments/enrollments.service';
import { coursesService } from '../courses/courses.service';
import { financeService } from '../finance/finance.service';
import { assignmentsService } from '../assignments/assignments.service';
import { gradesService } from '../grades/grades.service';
import { authService } from '../auth/auth.service';
import { ForbiddenException } from '../../common/exceptions/http.exception';
import { asyncHandler } from '../../common/utils/async.util';

/**
 * Controller to handle student-related HTTP requests.
 * Includes student registration, profile updates, and document generation (Exam Card, CAT Card, Transcript).
 */
export class StudentsController {
  
  /**
   * Log in a student.
   * Delegates to authService to verify password and issue JWT tokens.
   */
  login = asyncHandler(async (req: any, res: Response) => {
    const result = await authService.login(req.body);
    return result;
  });

  /**
   * Retrieve all student profiles.
   * Only accessible by Admins/Lecturers (restricted by routes configuration).
   */
  findAll = asyncHandler(async (req: any, res: Response) => {
    const result = await studentsService.findAll();
    return result;
  });

  /**
   * Fetch a single student profile by ID.
   * - Admins/Lecturers can view any student profile.
   * - Students can only access their own profile (matching email).
   */
  findOne = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const student = await studentsService.findOne(id);
    
    // RBAC: Check if the user is a student and trying to view another student's profile
    if (req.user.role === 'student' && req.user.email !== student.email) {
      throw new ForbiddenException('You can only access your own student profile');
    }
    return student;
  });

  /**
   * Register a new student profile.
   * - If request is authenticated, Admins can register anyone, but other users can only register themselves.
   * - If request is guest (unauthenticated), ensure the email doesn't already have a profile.
   */
  create = asyncHandler(async (req: any, res: Response) => {
    const dto = req.body;
    
    if (req.user) {
      // Authenticated registration permissions check
      if (req.user.role !== 'admin' && req.user.email !== dto.email) {
        throw new ForbiddenException(
          'You can only register a student profile for your own registered email address',
        );
      }
    } else {
      // Guest registration: Check if student already exists with this email address
      const existingUser = await studentsService.findByEmail(dto.email);
      if (existingUser) {
        throw new ForbiddenException(
          'A student profile with this email address already exists. Please log in first.',
        );
      }
    }
    const result = await studentsService.create(dto);
    return result;
  });

  /**
   * Update student profile details.
   * - Students can only update their own profile.
   */
  update = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const dto = req.body;
    const student = await studentsService.findOne(id);
    
    // Check permissions
    if (req.user.role === 'student' && req.user.email !== student.email) {
      throw new ForbiddenException('You can only update your own student profile');
    }
    const result = await studentsService.update(id, dto);
    return result;
  });

  /**
   * Delete a student profile.
   * - Admin only.
   */
  remove = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    await studentsService.remove(id);
    return null;
  });

  /**
   * Generate an Exam Card for a student.
   * - Contains registered courses, exam timetable, and tuition balance.
   * - Status is ELIGIBLE only if outstanding tuition balance is 0 or negative.
   */
  getExamCard = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const student = await studentsService.findOne(id);
    
    // Ensure permission check
    if (req.user.role === 'student' && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own exam card');
    }

    // Fetch student's course enrollments
    const studentEnrollments = await enrollmentsService.findByStudentId(student.id);

    // Fetch full details of each course registered
    const registeredCourses = [];
    for (const e of studentEnrollments) {
      try {
        const course = await coursesService.findOne(e.courseId);
        registeredCourses.push({
          courseId: course.id,
          name: course.name,
          code: course.code,
          timetable: course.timetable || 'TBD',
        });
      } catch (err) {
        // Ignore errors if a course was deleted
      }
    }

    // Fetch the tuition fee balance summary
    const balanceSummary = await financeService.getStudentFeeBalance(student.id);
    // Student is ELIGIBLE for examinations if there is no outstanding balance
    const eligibilityStatus = balanceSummary.outstandingBalance <= 0 ? 'ELIGIBLE' : 'INELIGIBLE';

    return {
      documentType: 'EXAM_CARD',
      title: 'University Management System — Examination Card',
      academicYear: new Date().getFullYear(),
      examSession: 'End of Semester',
      issuedAt: new Date().toISOString(),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        program: student.program || 'N/A',
        registeredAt: student.createdAt,
      },
      registeredCourses,
      financeSummary: {
        totalFeesDue: balanceSummary.totalFeesDue,
        totalPaid: balanceSummary.totalPaid,
        outstandingBalance: balanceSummary.outstandingBalance,
      },
      instructions: [
        'This card must be presented at the examination venue.',
        'Ensure all your fees are cleared before the examination.',
        'Late arrivals of more than 30 minutes will not be admitted.',
        'Mobile phones are not allowed in the examination hall.',
      ],
      status: eligibilityStatus,
    };
  });

  /**
   * Generate Continuous Assessment Test (CAT) Card.
   * - Aggregates assignment grades across all courses.
   * - A student must have a total average CAT score percentage >= 40% to be ELIGIBLE for examinations.
   */
  getCatCard = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const student = await studentsService.findOne(id);
    
    // Ensure permission check
    if (req.user.role === 'student' && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own CAT card');
    }

    const studentEnrollments = await enrollmentsService.findByStudentId(student.id);
    const submissions = await assignmentsService.getStudentSubmissions(student.id);

    const courseSummaries = [];
    let totalScored = 0;
    let totalPossible = 0;

    // Iterate through enrollments to compute the CAT average per course
    for (const e of studentEnrollments) {
      try {
        const course = await coursesService.findOne(e.courseId);
        const assignments = await assignmentsService.findByCourse(course.id);

        let courseScoreSum = 0;
        let gradedCount = 0;

        for (const assignment of assignments) {
          const sub = submissions.find(s => s.assignmentId === assignment.id);
          if (sub && sub.grade !== undefined && sub.grade !== null) {
            courseScoreSum += sub.grade;
            gradedCount++;
          }
        }

        // CAT score is the average of graded assignments
        const catScore = gradedCount > 0 ? (courseScoreSum / gradedCount) : null;
        
        if (catScore !== null) {
          totalScored += catScore;
          totalPossible += 100;
        }

        courseSummaries.push({
          courseName: course.name,
          courseCode: course.code,
          assignmentsCount: assignments.length,
          gradedCount,
          catScore: catScore !== null ? Math.round(catScore * 100) / 100 : 'N/A',
        });
      } catch (err) {
        // Skip failed iterations
      }
    }

    const averageCatPercentage = totalPossible > 0 ? (totalScored / totalPossible) * 100 : null;
    
    // Check if the student passes the 40% CAT benchmark
    let catStatus = 'PENDING';
    if (averageCatPercentage !== null) {
      catStatus = averageCatPercentage >= 40 ? 'ELIGIBLE' : 'INELIGIBLE';
    } else if (studentEnrollments.length > 0) {
      catStatus = 'ELIGIBLE';
    }

    return {
      documentType: 'CAT_CARD',
      title: 'University Management System — Continuous Assessment Card',
      academicYear: new Date().getFullYear(),
      issuedAt: new Date().toISOString(),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        program: student.program || 'N/A',
      },
      courseSummaries,
      catSummary: {
        totalCatWeight: 30,
        averageCatScorePercentage: averageCatPercentage !== null ? Math.round(averageCatPercentage * 100) / 100 : 'N/A',
        catStatus,
      },
      instructions: [
        'This card must be signed by your lecturer and submitted at the examination desk.',
        'A CAT score below 40% makes you ineligible for the final exam.',
      ],
    };
  });

  /**
   * Generate an official academic transcript.
   * - Maps GPAs to letter grades (A, B, C, D, F) and degree honors class classifications.
   */
  getTranscript = asyncHandler(async (req: any, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const student = await studentsService.findOne(id);
    
    // Ensure permission check
    if (req.user.role === 'student' && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own academic transcript');
    }

    const studentEnrollments = await enrollmentsService.findByStudentId(student.id);
    const enrollmentIds = studentEnrollments.map(e => e.id);
    const studentGrades = await gradesService.findByEnrollmentIds(enrollmentIds);

    const coursesRecord = [];
    let gpaSum = 0;
    let gradedCoursesCount = 0;

    for (const e of studentEnrollments) {
      try {
        const course = await coursesService.findOne(e.courseId);
        const gradeRecord = studentGrades.find(g => g.enrollmentId === e.id);

        let letterGrade = 'N/A';
        let gp = null;

        if (gradeRecord) {
          gp = gradeRecord.grade;
          gpaSum += gp;
          gradedCoursesCount++;

          // GPA and Grade conversion logic
          if (gp >= 3.7) letterGrade = 'A';
          else if (gp >= 3.0) letterGrade = 'B';
          else if (gp >= 2.0) letterGrade = 'C';
          else if (gp >= 1.0) letterGrade = 'D';
          else letterGrade = 'F';
        }

        coursesRecord.push({
          courseName: course.name,
          courseCode: course.code,
          grade: gp !== null ? gp : 'N/A',
          letterGrade,
          creditHours: 3,
        });
      } catch (err) {
        // Skip errors
      }
    }

    // Compute cumulative GPA (CGPA)
    const cumulativeGpa = gradedCoursesCount > 0 ? Math.round((gpaSum / gradedCoursesCount) * 100) / 100 : null;
    
    // Determine Honours Classification based on CGPA
    let classification = 'N/A';
    if (cumulativeGpa !== null) {
      if (cumulativeGpa >= 3.7) classification = 'First Class Honours';
      else if (cumulativeGpa >= 3.0) classification = 'Second Class Upper';
      else if (cumulativeGpa >= 2.0) classification = 'Second Class Lower';
      else if (cumulativeGpa >= 1.0) classification = 'Pass';
      else classification = 'Fail';
    }

    return {
      documentType: 'TRANSCRIPT',
      title: 'University Management System — Official Academic Transcript',
      issuedAt: new Date().toISOString(),
      academicYear: new Date().getFullYear(),
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        program: student.program || 'N/A',
        registeredAt: student.createdAt,
      },
      academicRecord: {
        totalCoursesCompleted: gradedCoursesCount,
        cumulativeGpa: cumulativeGpa !== null ? cumulativeGpa : 'N/A',
        classification,
        courses: coursesRecord,
      },
      footer: 'This transcript is valid only when bearing the official university seal and signature of the Registrar.',
    };
  });
}

// Export singleton instance
export const studentsController = new StudentsController();
