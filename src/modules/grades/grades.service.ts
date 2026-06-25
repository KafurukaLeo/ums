import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Grade } from './entities/grades.entity';
import { CreateGradeDto } from './dto/create.grade.dto';
import { UpdateGradeDto } from './dto/update.grade.dto';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  findAll(): Promise<Grade[]> {
    return this.gradeRepository.find();
  }

  /**
   * Retrieves all grades associated with a list of enrollment IDs.
   */
  findByEnrollmentIds(enrollmentIds: number[]): Promise<Grade[]> {
    if (!enrollmentIds || enrollmentIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.gradeRepository.find({
      where: { enrollmentId: In(enrollmentIds) },
    });
  }

  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findOneBy({ id });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  create(data: CreateGradeDto): Promise<Grade> {
    const grade = this.gradeRepository.create(data);
    return this.gradeRepository.save(grade);
  }

  async update(id: number, data: UpdateGradeDto): Promise<Grade> {
    await this.gradeRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.gradeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
  }
}
