import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entities';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update.enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find();
  }

  /**
   * Retrieves all enrollment records associated with a specific student ID.
   */
  findByStudentId(studentId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
    });
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOneBy({ id });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create(data);
    return this.enrollmentRepository.save(enrollment);
  }

  async update(id: number, data: UpdateEnrollmentDto): Promise<Enrollment> {
    await this.enrollmentRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.enrollmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
  }
}
