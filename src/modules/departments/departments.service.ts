/**
 * Module components file: departments.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create.department.dto';
import { UpdateDepartmentDto } from './dto/update.department.dto';

/**
 * Departments Service.
 * Handles database lookup and mutations for university departments.
 */
export class DepartmentsService {
  
  /**
   * Helper getter to resolve TypeORM repository for Department Entity.
   */
  private get departmentRepository() {
    return AppDataSource.getRepository(Department);
  }

  /**
   * Fetch all registered departments.
   */
  findAll(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  /**
   * Fetch a single department profile by ID.
   */
  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  /**
   * Create and save a new department definition.
   */
  create(data: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(data);
    return this.departmentRepository.save(department);
  }

  /**
   * Update details of an existing department.
   */
  async update(id: number, data: UpdateDepartmentDto): Promise<Department> {
    await this.departmentRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a department definition by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.departmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }
}

// Export singleton instance of DepartmentsService
export const departmentsService = new DepartmentsService();
