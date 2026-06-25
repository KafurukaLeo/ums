import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create.department.dto';
import { UpdateDepartmentDto } from './dto/update.department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.auth.guard';
import { RolesGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all departments (Admin, Lecturer, Student)' })
  findAll(): Promise<Department[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.LECTURER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a department by ID (Admin, Lecturer, Student)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a department — Admin only' })
  create(@Body() data: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.create(data);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a department — Admin only' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a department — Admin only' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
