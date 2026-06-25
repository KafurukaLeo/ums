import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';
import { CoursesService } from '../courses/courses.service';

/**
 * AssignmentsController defines all REST endpoints under /assignments.
 *
 * Role access summary:
 *  - LECTURER: create, update, delete assignments; view all submissions; grade submissions
 *  - STUDENT:  view assignments; submit own work; view own submissions
 *  - ADMIN:    full access to all endpoints
 *
 * All endpoints require a valid JWT token (@UseGuards(JwtAuthGuard)).
 * Role checking is done by RolesGuard using the @Roles() decorator.
 */
@ApiTags('assignments')          // Groups all routes under 'assignments' tag in Swagger UI
@ApiBearerAuth()                 // Tells Swagger UI that these endpoints need a Bearer token
@UseGuards(JwtAuthGuard, RolesGuard) // Every endpoint in this controller requires a valid JWT + role check
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly coursesService: CoursesService,
  ) {}

  // ─── ASSIGNMENT ENDPOINTS ───────────────────────────────────────────────────

  /**
   * GET /assignments
   * Returns all assignments.
   * Accessible by: Admin, Lecturer, Student (everyone can browse assignments)
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all assignments (Admin, Lecturer, Student)' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  /**
   * GET /assignments/course/:courseId
   * Returns all assignments for a specific course.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get assignments for a specific course (Admin, Lecturer, Student)' })
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.assignmentsService.findByCourse(courseId);
  }

  /**
   * GET /assignments/:id
   * Returns a single assignment by its ID.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single assignment by ID (Admin, Lecturer, Student)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.findOne(id);
  }

  /**
   * POST /assignments
   * Creates a new assignment for a course.
   * Accessible by: Admin, Lecturer only
   * Students cannot create assignments — only lecturers can.
   */
  @Post()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Create a new assignment — Lecturer/Admin only' })
  async create(
    @Body() dto: CreateAssignmentDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role !== Role.ADMIN) {
      const course = await this.coursesService.findOne(dto.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only create assignments for courses assigned to you');
      }
    }
    return this.assignmentsService.create(dto);
  }

  /**
   * PATCH /assignments/:id
   * Updates an existing assignment.
   * Accessible by: Admin, Lecturer only
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Update an assignment — Lecturer/Admin only' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role !== Role.ADMIN) {
      const assignment = await this.assignmentsService.findOne(id);
      const course = await this.coursesService.findOne(assignment.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only update assignments for courses assigned to you');
      }
    }
    return this.assignmentsService.update(id, dto);
  }

  /**
   * DELETE /assignments/:id
   * Permanently removes an assignment from the system.
   * Accessible by: Admin only — destructive action, only admin should do this.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an assignment — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.remove(id);
  }

  // ─── SUBMISSION ENDPOINTS ───────────────────────────────────────────────────

  /**
   * POST /assignments/:id/submit
   * Allows a student to upload/submit their work for an assignment.
   * Accessible by: Student, Admin only
   * Lecturers do not submit — only students do.
   */
  @Post(':id/submit')
  @Roles(Role.STUDENT, Role.ADMIN)
  @ApiOperation({ summary: 'Submit work for an assignment — Student only' })
  submit(
    @Param('id', ParseIntPipe) assignmentId: number,
    @Body() dto: SubmitAssignmentDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.STUDENT && req.user.studentId !== dto.studentId) {
      throw new ForbiddenException('You can only submit assignments for yourself');
    }
    return this.assignmentsService.submitAssignment(assignmentId, dto);
  }

  /**
   * GET /assignments/:id/submissions
   * Returns all submissions for a specific assignment.
   * Accessible by: Admin, Lecturer only — students should not see other students' work.
   */
  @Get(':id/submissions')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'View all submissions for an assignment — Lecturer/Admin only' })
  getSubmissions(@Param('id', ParseIntPipe) assignmentId: number) {
    return this.assignmentsService.getSubmissions(assignmentId);
  }

  /**
   * GET /assignments/submissions/student/:studentId
   * Returns all submissions made by a specific student.
   * Accessible by: Admin, Lecturer, Student (students can view their own submissions)
   */
  @Get('submissions/student/:studentId')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all submissions by a specific student (Admin, Lecturer, Student)' })
  getStudentSubmissions(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === Role.STUDENT && req.user.studentId !== studentId) {
      throw new ForbiddenException('You can only view your own submissions');
    }
    return this.assignmentsService.getStudentSubmissions(studentId);
  }

  /**
   * PATCH /assignments/submissions/:submissionId/grade
   * Allows a lecturer to add a grade and feedback to a submission.
   * Accessible by: Admin, Lecturer only
   */
  @Patch('submissions/:submissionId/grade')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Grade a student submission — Lecturer/Admin only' })
  async gradeSubmission(
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() dto: GradeSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role !== Role.ADMIN) {
      const submission = await this.assignmentsService.findSubmission(submissionId);
      const assignment = await this.assignmentsService.findOne(submission.assignmentId);
      const course = await this.coursesService.findOne(assignment.courseId);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only grade submissions for courses assigned to you');
      }
    }
    return this.assignmentsService.gradeSubmission(submissionId, dto);
  }
}
