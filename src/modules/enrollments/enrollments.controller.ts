import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from './enrollment.entities';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update.enrollment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';

/**
 * EnrollmentsController handles all REST endpoints for the /enrollments resource.
 *
 * Role access summary:
 *  - ADMIN:    full access — view all, create, update, delete enrollments
 *  - LECTURER: read-only — lecturers can see who is enrolled in their courses
 *  - STUDENT:  can create enrollments (enroll themselves in courses) and view enrollments
 *
 * Enrollment = the link between a student and a course (student joins a course).
 */
@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  /**
   * GET /enrollments
   * Returns all enrollment records.
   * Accessible by: Admin, Lecturer, Student
   * Lecturers use this to see which students are in their courses.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all enrollments (Admin, Lecturer, Student)' })
  async findAll(@Req() req: RequestWithUser): Promise<Enrollment[]> {
    const enrollments = await this.enrollmentsService.findAll();
    if (req.user.role === Role.STUDENT) {
      return enrollments.filter(e => e.studentId === req.user.studentId);
    }
    return enrollments;
  }

  /**
   * GET /enrollments/:id
   * Returns a single enrollment record by ID.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single enrollment by ID (Admin, Lecturer, Student)' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentsService.findOne(id);
    if (req.user.role === Role.STUDENT && enrollment.studentId !== req.user.studentId) {
      throw new ForbiddenException('You can only view your own enrollment record');
    }
    return enrollment;
  }

  /**
   * POST /enrollments
   * Creates a new enrollment (enrolls a student in a course).
   * Accessible by: Admin, Student only
   * Students use this to self-enroll. Lecturers do not enroll students.
   */
  @Post()
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Enroll a student in a course — Student/Admin only' })
  create(
    @Body() data: CreateEnrollmentDto,
    @Req() req: RequestWithUser,
  ): Promise<Enrollment> {
    if (req.user.role === Role.STUDENT && req.user.studentId !== data.studentId) {
      throw new ForbiddenException('You can only enroll yourself in courses');
    }
    return this.enrollmentsService.create(data);
  }

  /**
   * PATCH /enrollments/:id
   * Updates an enrollment record.
   * Accessible by: Admin only — only admins can modify enrollment data.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an enrollment — Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    return this.enrollmentsService.update(id, data);
  }

  /**
   * DELETE /enrollments/:id
   * Removes an enrollment (unenrolls a student from a course).
   * Accessible by: Admin only — only admins can forcefully remove enrollments.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an enrollment — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.enrollmentsService.remove(id);
  }
}
