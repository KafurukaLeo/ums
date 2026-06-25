import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create.student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CoursesService } from '../courses/courses.service';
import { FinanceService } from '../finance/finance.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { GradesService } from '../grades/grades.service';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * StudentsController handles all REST endpoints under /students.
 *
 * Role access summary:
 *  - ADMIN:    full access — view all students, create, update, delete student records
 *  - LECTURER: read-only — lecturers can view the student list (e.g. class roster)
 *  - STUDENT:  can register their own student profile, update their own profile,
 *              and access their own document endpoints (exam card, CAT card, transcript)
 *
 * Special student-only document endpoints:
 *  - GET /students/:id/exam-card   → download Exam Card (exam eligibility document)
 *  - GET /students/:id/cat-card    → download CAT Card (Continuous Assessment Test card)
 *  - GET /students/:id/transcript  → download Academic Transcript (grades summary)
 *
 * All endpoints require a valid JWT token.
 */
@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly coursesService: CoursesService,
    private readonly financeService: FinanceService,
    private readonly assignmentsService: AssignmentsService,
    private readonly gradesService: GradesService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * POST /students/login
   * Logs in a student and returns JWT tokens.
   */
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in a student and receive JWT tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /students
   * Returns all student records.
   * Accessible by: Admin, Lecturer (to see their class roster)
   * Note: Students are not listed for all students to browse each other.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get all students (Admin, Lecturer)' })
  findAll(): Promise<Student[]> {
    return this.studentsService.findAll();
  }

  /**
   * GET /students/:id
   * Returns a single student record by their numeric ID.
   * Accessible by: Admin, Lecturer, Student
   * Students can view their own profile.
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single student by ID (Admin, Lecturer, Student)' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<Student> {
    const student = await this.studentsService.findOne(id);
    if (req.user.role === Role.STUDENT && req.user.email !== student.email) {
      throw new ForbiddenException('You can only access your own student profile');
    }
    return student;
  }

  /**
   * POST /students
   * Registers a student profile in the university system.
   * Accessible by: Admin, Student only
   *
   * A logged-in user with the 'student' role must complete this step after registering
   * via /auth/register. It links their user account to a student profile.
   *
   * Guard logic: A non-admin student can only register a profile for their own email.
   */
  @Public()
  @Post()
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Register a student profile — Student/Admin only' })
  async create(
    @Body() dto: CreateStudentDto,
    @Req() req: RequestWithUser,
  ): Promise<Student> {
    if (req.user) {
      // Prevent a student from registering a profile under someone else's email.
      // Admins bypass this check and can register any student.
      if (req.user.role !== Role.ADMIN && req.user.email !== dto.email) {
        throw new ForbiddenException(
          'You can only register a student profile for your own registered email address',
        );
      }
    } else {
      // For unauthenticated registration, check if the email already exists
      const existingUser = await this.studentsService.findByEmail(dto.email);
      if (existingUser) {
        throw new ForbiddenException(
          'A student profile with this email address already exists. Please log in first.',
        );
      }
    }
    return this.studentsService.create(dto);
  }

  /**
   * PATCH /students/:id
   * Updates a student's profile details (name, etc.).
   * Accessible by: Admin, Student only
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Update a student profile — Student/Admin only' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
    @Req() req: RequestWithUser,
  ): Promise<Student> {
    const student = await this.studentsService.findOne(id);
    if (req.user.role === Role.STUDENT && req.user.email !== student.email) {
      throw new ForbiddenException('You can only update your own student profile');
    }
    return this.studentsService.update(id, dto);
  }

  /**
   * DELETE /students/:id
   * Permanently removes a student record from the system.
   * Accessible by: Admin only — only admins can delete student accounts.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a student — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.studentsService.remove(id);
  }

  // ─── STUDENT DOCUMENT ENDPOINTS ─────────────────────────────────────────────

  /**
   * GET /students/:id/exam-card
   * Returns an Exam Card for the student.
   *
   * The Exam Card confirms that the student is eligible to sit for the upcoming examinations.
   * 
   * Logic:
   * 1. Fetches the student details.
   * 2. Queries all enrollments and maps them to their course names and timetables.
   * 3. Queries the student's fee balance.
   *    If outstandingBalance <= 0, status is ELIGIBLE, otherwise INELIGIBLE (fees not cleared).
   */
  @Get(':id/exam-card')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Download Exam Card — Student/Admin only' })
  async getExamCard(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    // 1. Fetch the student profile from the database by ID (throws NotFoundException if not found).
    const student = await this.studentsService.findOne(id);
    if (req.user.role === Role.STUDENT && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own exam card');
    }

    // 2. Fetch only the enrollments for the target student from the database.
    const studentEnrollments = await this.enrollmentsService.findByStudentId(student.id);

    // For each enrollment, fetch the associated course details (like name, code, and timetable schedule).
    const registeredCourses = [];
    for (const e of studentEnrollments) {
      try {
        const course = await this.coursesService.findOne(e.courseId);
        registeredCourses.push({
          courseId: course.id,
          name: course.name,
          code: course.code,
          timetable: course.timetable || 'TBD', // Fallback to 'TBD' if no timetable is allocated yet
        });
      } catch (err) {
        // If a course was deleted but enrollment remains, fail gracefully by skipping it
      }
    }

    // 3. Query the student's fee status using the Finance Module.
    const balanceSummary = await this.financeService.getStudentFeeBalance(student.id);
    
    // Determine exam eligibility: Student must have fully paid their tuition (outstanding balance is 0 or less).
    const eligibilityStatus = balanceSummary.outstandingBalance <= 0 ? 'ELIGIBLE' : 'INELIGIBLE';

    // Return structured data representing the Exam Card document
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
  }

  /**
   * GET /students/:id/cat-card
   * Returns a CAT (Continuous Assessment Test) Card for the student.
   *
   * The CAT Card summarises the student's continuous assessment results (assignments).
   * 
   * Logic:
   * 1. Fetches the student details.
   * 2. Finds student enrollments.
   * 3. For each enrollment, finds assignments for that course and student submissions.
   * 4. Computes the average assignment grade for each course.
   * 5. Aggregates the general CAT status (ELIGIBLE if average score >= 40%, or if no assignments yet).
   */
  @Get(':id/cat-card')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Download CAT Card — Student/Admin only' })
  async getCatCard(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    // 1. Fetch the student profile from the database.
    const student = await this.studentsService.findOne(id);
    if (req.user.role === Role.STUDENT && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own CAT card');
    }

    // 2. Fetch only the enrollments for the target student from the database.
    const studentEnrollments = await this.enrollmentsService.findByStudentId(student.id);

    // Fetch all submissions for this student once outside the loop to prevent N+1 query overhead.
    const submissions = await this.assignmentsService.getStudentSubmissions(student.id);

    const courseSummaries = [];
    let totalScored = 0;
    let totalPossible = 0;

    // 3. Loop through each enrolled course to calculate continuous assessment scores
    for (const e of studentEnrollments) {
      try {
        const course = await this.coursesService.findOne(e.courseId);
        
        // Fetch all assignments associated with this specific course.
        const assignments = await this.assignmentsService.findByCourse(course.id);

        let courseScoreSum = 0;
        let gradedCount = 0;

        // Match the course's assignments to the student's submissions to get grades.
        for (const assignment of assignments) {
          const sub = submissions.find(s => s.assignmentId === assignment.id);
          if (sub && sub.grade !== undefined && sub.grade !== null) {
            courseScoreSum += sub.grade;
            gradedCount++;
          }
        }

        // Calculate the student's average assignment grade for this course.
        // Assuming assignments are scored out of 100%.
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
        // Skip errors for individual courses to prevent entire card from breaking
      }
    }

    // 4. Calculate cumulative assessment average percentage across all graded courses.
    const averageCatPercentage = totalPossible > 0 ? (totalScored / totalPossible) * 100 : null;
    
    // 5. Compute eligibility status. Must attain at least 40% in CAT assessments.
    // If no assignments have been created/graded yet, default to ELIGIBLE so the student is not blocked.
    let catStatus = 'PENDING';
    if (averageCatPercentage !== null) {
      catStatus = averageCatPercentage >= 40 ? 'ELIGIBLE' : 'INELIGIBLE';
    } else if (studentEnrollments.length > 0) {
      catStatus = 'ELIGIBLE';
    }

    // Return CAT Card structure
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
        totalCatWeight: 30, // CAT contributes 30% of final grade
        averageCatScorePercentage: averageCatPercentage !== null ? Math.round(averageCatPercentage * 100) / 100 : 'N/A',
        catStatus,
      },
      instructions: [
        'This card must be signed by your lecturer and submitted at the examination desk.',
        'A CAT score below 40% makes you ineligible for the final exam.',
      ],
    };
  }

  /**
   * GET /students/:id/transcript
   * Returns the Academic Transcript for the student.
   *
   * Logic:
   * 1. Fetches student details.
   * 2. Finds all course enrollments.
   * 3. Queries grades corresponding to each enrollment.
   * 4. Converts grades (assuming GPA scale 0.0 - 4.0) to letter grades (A, B, C, D, F).
   * 5. Computes Cumulative GPA and classification (e.g. First Class Honours).
   */
  @Get(':id/transcript')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Print/Download Academic Transcript — Student/Admin only' })
  async getTranscript(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    // 1. Fetch student details
    const student = await this.studentsService.findOne(id);
    if (req.user.role === Role.STUDENT && req.user.email !== student.email) {
      throw new ForbiddenException('You can only view your own academic transcript');
    }

    // 2. Fetch only the enrollments for the target student from the database.
    const studentEnrollments = await this.enrollmentsService.findByStudentId(student.id);
    
    // Fetch only final grade records matching the student's enrollment IDs.
    const enrollmentIds = studentEnrollments.map(e => e.id);
    const studentGrades = await this.gradesService.findByEnrollmentIds(enrollmentIds);

    const coursesRecord = [];
    let gpaSum = 0;
    let gradedCoursesCount = 0;

    // 3. Map final grades to each enrolled course
    for (const e of studentEnrollments) {
      try {
        const course = await this.coursesService.findOne(e.courseId);
        
        // Find the final grade record matching this enrollment ID
        const gradeRecord = studentGrades.find(g => g.enrollmentId === e.id);

        let letterGrade = 'N/A';
        let gp = null;

        if (gradeRecord) {
          gp = gradeRecord.grade; // Grade is represented on a 0.0 to 4.0 GPA scale
          gpaSum += gp;
          gradedCoursesCount++;

          // 4. Map the GPA point to standard letter grade boundaries
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
          creditHours: 3, // Default credit hours weight per course
        });
      } catch (err) {
        // Ignore individual course mapping errors to avoid failing the transcript request
      }
    }

    // 5. Calculate cumulative GPA (simple average of graded courses)
    const cumulativeGpa = gradedCoursesCount > 0 ? Math.round((gpaSum / gradedCoursesCount) * 100) / 100 : null;
    
    // Classify the degree class/honours depending on cumulative GPA score
    let classification = 'N/A';
    if (cumulativeGpa !== null) {
      if (cumulativeGpa >= 3.7) classification = 'First Class Honours';
      else if (cumulativeGpa >= 3.0) classification = 'Second Class Upper';
      else if (cumulativeGpa >= 2.0) classification = 'Second Class Lower';
      else if (cumulativeGpa >= 1.0) classification = 'Pass';
      else classification = 'Fail';
    }

    // Return the completed transcript object
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
      footer:
        'This transcript is valid only when bearing the official university seal and signature of the Registrar.',
    };
  }
}
