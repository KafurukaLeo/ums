import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create.admin.dto';
import { UpdateAdminDto } from './dto/update.admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';

/**
 * AdminController handles all REST endpoints for the /admin resource.
 *
 * Role access summary:
 *  - ADMIN only: ALL endpoints are restricted exclusively to the Admin role.
 *
 * This is the most restricted section of the API.
 * Only system administrators can view, create, update, or delete admin accounts.
 * Lecturers and students have zero access to this controller.
 */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Class-level decorator: ALL routes in this controller require Admin role
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin
   * Returns all admin accounts in the system.
   * Admin only — no other role should see admin account details.
   */
  @Get()
  @ApiOperation({ summary: 'Get all admin accounts — Admin only' })
  findAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  /**
   * GET /admin/:id
   * Returns a single admin account by their numeric ID.
   * Admin only.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single admin by ID — Admin only' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Admin> {
    return this.adminService.findOne(id);
  }

  /**
   * POST /admin
   * Creates a new admin account.
   * Admin only — only existing admins can create new admins (controlled escalation).
   */
  @Post()
  @ApiOperation({ summary: 'Create a new admin account — Admin only' })
  create(@Body() data: CreateAdminDto): Promise<Admin> {
    return this.adminService.create(data);
  }

  /**
   * PATCH /admin/:id
   * Updates an existing admin account (name, email, password, etc.).
   * Admin only.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin account — Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAdminDto,
  ): Promise<Admin> {
    return this.adminService.update(id, data);
  }

  /**
   * DELETE /admin/:id
   * Permanently deletes an admin account.
   * Admin only — only admins can remove other admin accounts.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin account — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminService.remove(id);
  }
}
