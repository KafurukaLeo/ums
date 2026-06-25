import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  findAssignedCourses(lecturerId: number): Promise<Course[]> {
    return this.courseRepository.find({ where: { lecturerId } });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneBy({ id });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  create(data: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(data);
    return this.courseRepository.save(course);
  }

  async update(id: number, data: UpdateCourseDto): Promise<Course> {
    await this.courseRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
