import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Dashboard } from './entities/dashboard.entity';
import { CreateDashboardDto } from './dto/create.dashboard.dto';
import { UpdateDashboardDto } from './dto/update.dashboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all dashboard widgets (Admin, Lecturer, Student)' })
  findAll(): Promise<Dashboard[]> {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a dashboard widget by ID (Admin, Lecturer, Student)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Dashboard> {
    return this.dashboardService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a dashboard widget — Admin only' })
  create(@Body() data: CreateDashboardDto): Promise<Dashboard> {
    return this.dashboardService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a dashboard widget — Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDashboardDto,
  ): Promise<Dashboard> {
    return this.dashboardService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a dashboard widget — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dashboardService.remove(id);
  }
}
