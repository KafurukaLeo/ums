import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';

/**
 * Course Service class.
 * Handles database operations for Course entities, including allocation mappings to lecturers.
 */
export class CoursesService {
  
  /**
   * Helper getter to resolve TypeORM repository for Course Entity.
   */
  private get courseRepository() {
    return AppDataSource.getRepository(Course);
  }

  /**
   * Fetch all course records.
   */
  findAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  /**
   * Fetch courses allocated/assigned to a specific lecturer.
   */
  findAssignedCourses(lecturerId: number): Promise<Course[]> {
    return this.courseRepository.find({ where: { lecturerId } });
  }

  /**
   * Fetch a single course by its ID.
   */
  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneBy({ id });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  /**
   * Create and save a new course record.
   */
  create(data: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(data);
    return this.courseRepository.save(course);
  }

  /**
   * Update course details by ID.
   */
  async update(id: number, data: UpdateCourseDto): Promise<Course> {
    await this.courseRepository.update(id, data);
    return this.findOne(id);
  }

  /**
   * Delete a course record by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.courseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}

// Export singleton instance of CoursesService
export const coursesService = new CoursesService();
