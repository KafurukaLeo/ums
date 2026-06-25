import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';
import { RequestWithUser } from '../../types/request-with-user.type';

/**
 * CoursesController handles all REST endpoints for the /courses resource.
 *
 * Role access summary:
 *  - ADMIN:    full access — can create, update, delete, and read all courses
 *  - LECTURER: can create/update courses (to manage their own teaching material)
 *  - STUDENT:  read-only — can browse available courses to enroll in
 *
 * All endpoints require authentication via JWT (@ApiBearerAuth / JwtAuthGuard).
 */
@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Apply JWT check AND role check to all routes
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * GET /courses
   * Returns the full list of courses.
   * Accessible by: Admin, Lecturer, Student
   * Students use this to browse available courses before enrolling.
   */
  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all courses (Admin, Lecturer, Student)' })
  findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  /**
   * GET /courses/:id
   * Returns a single course by its numeric ID.
   * Accessible by: Admin, Lecturer, Student
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single course by ID (Admin, Lecturer, Student)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  /**
   * POST /courses
   * Creates a new course in the system.
   * Accessible by: Admin, Lecturer only
   * Students cannot create courses — only lecturers/admins can manage the course catalog.
   */
  @Post()
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Create a new course — Lecturer/Admin only' })
  create(@Body() data: CreateCourseDto): Promise<Course> {
    return this.coursesService.create(data);
  }

  /**
   * PATCH /courses/:id
   * Updates an existing course (e.g. change name or code).
   * Accessible by: Admin, Lecturer only
   */
  @Patch(':id')
  @Roles(Role.ADMIN, Role.LECTURER)
  @ApiOperation({ summary: 'Update a course — Lecturer/Admin only' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCourseDto,
    @Req() req: RequestWithUser,
  ): Promise<Course> {
    if (req.user.role !== Role.ADMIN) {
      const course = await this.coursesService.findOne(id);
      if (course.lecturerId !== req.user.lecturerId) {
        throw new ForbiddenException('You can only update courses assigned to you');
      }
    }
    return this.coursesService.update(id, data);
  }

  /**
   * PATCH /courses/:id/allocate
   * Allocates a lecturer to a course.
   * Accessible by: Admin only.
   * 
   * Logic:
   * 1. Extracts the course ID from the URL path.
   * 2. Extracts the lecturerId from the request body.
   * 3. Calls the coursesService update method to assign the lecturer.
   */
  @Patch(':id/allocate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Allocate a course to a lecturer — Admin only' })
  async allocate(
    @Param('id', ParseIntPipe) id: number,
    @Body('lecturerId', ParseIntPipe) lecturerId: number,
  ): Promise<Course> {
    return this.coursesService.update(id, { lecturerId });
  }

  /**
   * DELETE /courses/:id
   * Permanently removes a course from the system.
   * Accessible by: Admin only — this is a destructive action; only admins can remove courses.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a course — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.coursesService.remove(id);
  }
}
