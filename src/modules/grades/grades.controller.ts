import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { Grade } from './entities/grades.entity';
import { CreateGradeDto } from './dto/create.grade.dto';
import { UpdateGradeDto } from './dto/update.grade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';
import { EnrollmentsService } from '../enrollments/enrollments.service';

/**
 * GradesController handles all REST endpoints for the /grades resource.
 *
 * Role access summary:
 *  - ADMIN:    full access — view all, create, update, delete grades
 *  - LECTURER: can create and update grades (grading student work is the lecturer's job)
 *  - STUDENT:  read-only — students can see their grades but cannot modify them
 *
 * A Grade record links to an Enrollment, providing the final grade for a course.
 */
@ApiTags('grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  /**
   * GET /grades
   * Returns all grade records.
   * Accessible by: Admin, Lecturer, Student
   * Students use this to check their academic results.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all grades (Admin, Lecturer, Student)' })
  async findAll(@Req() req: RequestWithUser): Promise<Grade[]> {
    const grades = await this.gradesService.findAll();
    if (req.user.role === Role.STUDENT) {
      const studentEnrollments = await this.enrollmentsService.findAll();
      const myEnrollmentIds = studentEnrollments
        .filter(e => e.studentId === req.user.studentId)
        .map(e => e.id);
      return grades.filter(g => myEnrollmentIds.includes(g.enrollmentId));
    }
    return grades;
  }

  /**
   * GET /grades/:id
   * Returns a single grade record by its ID.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a grade by ID (Admin, Lecturer, Student)' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<Grade> {
    const grade = await this.gradesService.findOne(id);
    if (req.user.role === Role.STUDENT) {
      const enrollment = await this.enrollmentsService.findOne(grade.enrollmentId);
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only view your own grades');
      }
    }
    return grade;
  }

  /**
   * POST /grades
   * Creates a new grade entry for an enrollment.
   * Accessible by: Admin, Lecturer only
   * Only lecturers/admins can assign grades — students cannot self-grade.
   */
  @Post()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Create a grade — Lecturer/Admin only' })
  create(@Body() data: CreateGradeDto): Promise<Grade> {
    return this.gradesService.create(data);
  }

  /**
   * PATCH /grades/:id
   * Updates an existing grade (e.g. re-grading after an appeal).
   * Accessible by: Admin, Lecturer only
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Update a grade — Lecturer/Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateGradeDto,
  ): Promise<Grade> {
    return this.gradesService.update(id, data);
  }

  /**
   * DELETE /grades/:id
   * Deletes a grade record.
   * Accessible by: Admin only — grade deletion is an admin-level administrative action.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a grade — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.gradesService.remove(id);
  }
}
