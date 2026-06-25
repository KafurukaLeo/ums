import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create.attendance.dto';
import { UpdateAttendanceDto } from './dto/update.attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';
import { EnrollmentsService } from '../enrollments/enrollments.service';

/**
 * AttendanceController handles all REST endpoints for the /attendance resource.
 *
 * Role access summary:
 *  - ADMIN:    full access — view all, create, update, delete attendance records
 *  - LECTURER: can create attendance records (marks students present/absent)
 *              and update them in case of mistakes
 *  - STUDENT:  can record their own attendance check-in (POST) and view records
 *
 * Attendance records link an enrollment to a specific date and a status (present/absent/late).
 */
@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  /**
   * GET /attendance
   * Returns all attendance records.
   * Accessible by: Admin, Lecturer, Student
   * Students can view their own attendance history.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all attendance records (Admin, Lecturer, Student)' })
  async findAll(@Req() req: RequestWithUser): Promise<Attendance[]> {
    const records = await this.attendanceService.findAll();
    if (req.user.role === Role.STUDENT) {
      const studentEnrollments = await this.enrollmentsService.findAll();
      const myEnrollmentIds = studentEnrollments
        .filter(e => e.studentId === req.user.studentId)
        .map(e => e.id);
      return records.filter(r => myEnrollmentIds.includes(r.enrollmentId));
    }
    return records;
  }

  /**
   * GET /attendance/:id
   * Returns a single attendance record by ID.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single attendance record by ID (Admin, Lecturer, Student)' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<Attendance> {
    const record = await this.attendanceService.findOne(id);
    if (req.user.role === Role.STUDENT) {
      const enrollment = await this.enrollmentsService.findOne(record.enrollmentId);
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only view your own attendance records');
      }
    }
    return record;
  }

  /**
   * POST /attendance
   * Creates a new attendance record.
   * Accessible by: Admin, Lecturer, Student
   * - Lecturers mark students as present/absent.
   * - Students can self-check-in (e.g. via QR code or portal).
   */
  @Post()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Mark attendance (Admin, Lecturer, Student)' })
  async create(
    @Body() data: CreateAttendanceDto,
    @Req() req: RequestWithUser,
  ): Promise<Attendance> {
    if (req.user.role === Role.STUDENT) {
      const enrollment = await this.enrollmentsService.findOne(data.enrollmentId);
      if (enrollment.studentId !== req.user.studentId) {
        throw new ForbiddenException('You can only check in to your own enrollments');
      }
    }
    return this.attendanceService.create(data);
  }

  /**
   * PATCH /attendance/:id
   * Updates an existing attendance record (e.g. correcting a wrong status).
   * Accessible by: Admin, Lecturer only — students cannot alter attendance records.
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Update an attendance record — Lecturer/Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAttendanceDto,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, data);
  }

  /**
   * DELETE /attendance/:id
   * Permanently removes an attendance record.
   * Accessible by: Admin only — deletion of attendance records is an admin-only action.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an attendance record — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attendanceService.remove(id);
  }
}
