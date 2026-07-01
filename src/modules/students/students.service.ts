/**
 * Module components file: students.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create.student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { usersService } from '../users/users.service';

/**
 * Student Service class.
 * Handles database operations for student profile configurations.
 */
export class StudentsService {
  
  /**
   * Helper getter to resolve TypeORM repository for Student Entity.
   */
  private get studentRepository() {
    return AppDataSource.getRepository(Student);
  }

  /**
   * Fetch all student profiles.
   */
  findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  /**
   * Fetch a single student profile by ID.
   */
  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  /**
   * Look up student profile by email.
   */
  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepository.findOneBy({ email });
  }

  /**
   * Create a new student profile.
   * - Ensures that a related base User account exists or creates one.
   * - Saves the student profile info (parsing dateOfBirth if present).
   * - Handles profile updates if the profile already exists.
   */
  async create(dto: CreateStudentDto): Promise<Student> {
    // Check if base User account exists; if not, auto-create a user account
    let user = await usersService.findByEmail(dto.email);
    if (!user) {
      user = await usersService.create({
        name: dto.name,
        email: dto.email,
        password: dto.password || 'password123',
        role: 'student',
        isEmailVerified: true,
      } as any);
    }

    const { password, ...studentFields } = dto;
    const studentData: any = {
      ...studentFields,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };

    // If profile is already created, update and return it
    const existingStudent = await this.studentRepository.findOneBy({ email: dto.email });
    if (existingStudent) {
      await this.studentRepository.update(existingStudent.id, studentData);
      return this.findOne(existingStudent.id);
    }

    // Save new student record
    const student = this.studentRepository.create(studentData);
    const saved = await this.studentRepository.save(student);
    return saved as unknown as Student;
  }

  /**
   * Update student profile fields.
   */
  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const updateData: any = {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };
    await this.studentRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete student profile by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.studentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }
}

// Export singleton instance of StudentsService
export const studentsService = new StudentsService();
