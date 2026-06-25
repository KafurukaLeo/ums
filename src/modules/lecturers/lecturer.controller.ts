import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LecturerService } from './lecturer.service';
import { Lecturer } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dto/create.lecturer.dto';
import { UpdateLecturerDto } from './dto/update.lecturer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { CoursesService } from '../courses/courses.service';
import { Course } from '../courses/entities/course.entity';
import { RequestWithUser } from '../../types/request-with-user.type';

/**
 * LecturerController handles all REST endpoints for the /lecturers resource.
 *
 * Role access summary:
 *  - ADMIN:    full access — view all, create, update, delete lecturers
 *  - LECTURER: read-only + can update their own profile
 *  - STUDENT:  no access — students do not manage lecturer records
 *
 * Lecturers are university staff who teach courses and grade students.
 */
@ApiTags('lecturers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lecturers')
export class LecturerController {
  constructor(
    private readonly lecturerService: LecturerService,
    private readonly coursesService: CoursesService,
  ) {}

  /**
   * GET /lecturers
   * Returns the full list of lecturers.
   * Accessible by: Admin, Lecturer only
   * Students do not need direct access to the lecturers list.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get all lecturers (Admin, Lecturer)' })
  findAll(): Promise<Lecturer[]> {
    return this.lecturerService.findAll();
  }

  /**
   * GET /lecturers/:id
   * Returns a single lecturer by their numeric ID.
   * Accessible by: Admin, Lecturer
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get a single lecturer by ID (Admin, Lecturer)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lecturer | null> {
    return this.lecturerService.findOne(id);
  }

  /**
   * POST /lecturers
   * Creates a new lecturer record.
   * Accessible by: Admin only — only admins can add lecturers to the system.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new lecturer — Admin only' })
  create(@Body() dto: CreateLecturerDto): Promise<Lecturer> {
    return this.lecturerService.create(dto);
  }

  /**
   * PATCH /lecturers/:id
   * Updates a lecturer's details (name, email, etc.).
   * Accessible by: Admin, Lecturer — admins can update any, lecturers can update their profile.
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Update a lecturer — Lecturer/Admin only' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLecturerDto,
    @Req() req: RequestWithUser,
  ): Promise<Lecturer | null> {
    if (req.user.role !== Role.ADMIN) {
      const lecturer = await this.lecturerService.findOne(id);
      if (!lecturer || lecturer.email !== req.user.email) {
        throw new ForbiddenException('You can only update your own lecturer profile');
      }
    }
    return this.lecturerService.update(id, dto);
  }

  /**
   * GET /lecturers/:id/courses
   * Returns the list of courses assigned to a specific lecturer.
   * Accessible by: Admin, Lecturer.
   * 
   * Logic:
   * 1. Verifies that the lecturer exists using lecturerService.findOne (throws 404 if not).
   * 2. Queries and returns the courses using coursesService.findAssignedCourses.
   */
  @Get(':id/courses')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Get courses assigned to a lecturer (Admin, Lecturer)' })
  async getAssignedCourses(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ): Promise<Course[]> {
    if (req.user.role !== Role.ADMIN) {
      const lecturer = await this.lecturerService.findOne(id);
      if (!lecturer || lecturer.email !== req.user.email) {
        throw new ForbiddenException('You can only view your own assigned courses');
      }
    }
    // Check if lecturer exists
    await this.lecturerService.findOne(id);
    // Find courses assigned to them
    return this.coursesService.findAssignedCourses(id);
  }

  /**
   * DELETE /lecturers/:id
   * Permanently removes a lecturer from the system.
   * Accessible by: Admin only — only admins can remove lecturer accounts.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a lecturer — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.lecturerService.remove(id);
  }
}