import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';

/**
 * UsersController handles all REST endpoints for the /users resource.
 *
 * Role access summary:
 *  - ADMIN only: ALL endpoints are restricted exclusively to the Admin role.
 *
 * The /users resource represents system-level user accounts (authentication identities).
 * Only admins should be able to view or manage user accounts directly.
 * Regular users manage their own profile via the /auth and /students endpoints.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // All routes in this controller are Admin-only
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Directly creates a new user record.
   * Admin only — normally users register via /auth/register; this is an admin override.
   */
  @Post()
  @ApiOperation({ summary: 'Create a user directly — Admin only' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users
   * Returns all registered user accounts in the system.
   * Admin only — used for user management (seeing who has access to the system).
   */
  @Get()
  @ApiOperation({ summary: 'Get all users — Admin only' })
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id
   * Returns a single user account by their ID.
   * Admin only — for individual user inspection or support.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID — Admin only' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Updates a user account (e.g. changing their role, email, or name).
   * Admin only — role escalation/demotion must be an admin action.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user — Admin only' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Permanently removes a user account from the system.
   * Admin only — user deletion is a sensitive administrative action.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
