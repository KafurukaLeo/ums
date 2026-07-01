/**
 * Module components file: enrollments.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Enrollment } from './enrollment.entities';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update.enrollment.dto';

/**
 * Enrollment Service class.
 * Handles database operations for student course enrollments.
 */
export class EnrollmentsService {
  
  /**
   * Helper getter to resolve TypeORM repository for Enrollment Entity.
   */
  private get enrollmentRepository() {
    return AppDataSource.getRepository(Enrollment);
  }

  /**
   * Fetch all enrollment records in the system.
   */
  findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find();
  }

  /**
   * Fetch all course enrollments registered to a specific student.
   */
  findByStudentId(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
    });
  }

  /**
   * Fetch a single enrollment record by ID.
   */
  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOneBy({ id });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  /**
   * Create and save a new course enrollment.
   */
  create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create(data);
    return this.enrollmentRepository.save(enrollment);
  }

  /**
   * Update details of an existing enrollment.
   */
  async update(id: number, data: UpdateEnrollmentDto): Promise<Enrollment> {
    await this.enrollmentRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete/Cancel an enrollment by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.enrollmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
  }
}

// Export singleton instance of EnrollmentsService
export const enrollmentsService = new EnrollmentsService();
