/**
 * Module components file: grades.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Grade } from './entities/grades.entity';
import { CreateGradeDto } from './dto/create.grade.dto';
import { UpdateGradeDto } from './dto/update.grade.dto';
import { In } from 'typeorm';

/**
 * Grades Service.
 * Handles database operations for recorded final grades of course enrollments.
 */
export class GradesService {
  
  /**
   * Helper getter to resolve TypeORM repository for Grade Entity.
   */
  private get gradeRepository() {
    return AppDataSource.getRepository(Grade);
  }

  /**
   * Fetch all grade records.
   */
  findAll(): Promise<Grade[]> {
    return this.gradeRepository.find();
  }

  /**
   * Fetch grades matching a set of enrollment IDs.
   * Useful for pulling a student's transcript grades.
   */
  findByEnrollmentIds(enrollmentIds: number[]): Promise<Grade[]> {
    if (!enrollmentIds || enrollmentIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.gradeRepository.find({
      where: { enrollmentId: In(enrollmentIds) },
    });
  }

  /**
   * Fetch a single grade record by ID.
   */
  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findOneBy({ id });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  /**
   * Create and save a new grade record.
   */
  create(data: CreateGradeDto): Promise<Grade> {
    const grade = this.gradeRepository.create(data);
    return this.gradeRepository.save(grade);
  }

  /**
   * Update details of an existing grade record.
   */
  async update(id: number, data: UpdateGradeDto): Promise<Grade> {
    await this.gradeRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a grade record by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.gradeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
  }
}

// Export singleton instance of GradesService
export const gradesService = new GradesService();
