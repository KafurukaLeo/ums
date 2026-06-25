import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create.department.dto';
import { UpdateDepartmentDto } from './dto/update.department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  findAll(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  create(data: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(data);
    return this.departmentRepository.save(department);
  }

  async update(id: number, data: UpdateDepartmentDto): Promise<Department> {
    await this.departmentRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.departmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }
}
