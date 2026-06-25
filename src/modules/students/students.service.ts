import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create.student.dto';
import { UpdateStudentDto } from './dto/update.student.dto';
import { UsersService } from '../users/users.service';

/**
 * Service class implementing business logic and database interactions for Students.
 * Decorated with @Injectable to make it available for dependency injection.
 */
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) // Injecting the database Repository instance for the Student entity
    private readonly studentRepository: Repository<Student>,
    private readonly usersService: UsersService, // Injecting the UsersService to verify registrations
  ) {}

  /**
   * Fetches all student records from the database.
   */
  findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  /**
   * Fetches a single student record by their numeric primary key (ID).
   * Throws a NotFoundException (HTTP 404) if no record matches.
   */
  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOneBy({ id });
    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
    return student;
  }

  /**
   * Fetches a student record by their email address.
   * Returns null if no record is found.
   */
  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepository.findOneBy({ email });
  }

  /**
   * Instantiates and saves a new student record into the database.
   * Verifies the user has registered first.
   */
  async create(dto: CreateStudentDto): Promise<Student> {
    // Check if the user is registered in the university database.
    // If not, automatically create the user account first to allow creation in either order.
    let user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        password: dto.password || 'password123', // Use custom password if provided, otherwise default to password123
        role: 'student',
        isEmailVerified: true,
      } as any);
    }

    // Build the student data object (excluding password which belongs to the user auth record), converting dateOfBirth string → Date if provided
    const { password, ...studentFields } = dto;
    const studentData: any = {
      ...studentFields,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };

    // Check if student profile with this email already exists (upsert behavior)
    const existingStudent = await this.studentRepository.findOneBy({ email: dto.email });
    if (existingStudent) {
      await this.studentRepository.update(existingStudent.id, studentData);
      return this.findOne(existingStudent.id);
    }

    // Repository.create instantiates the entity without saving it
    const student = this.studentRepository.create(studentData);
    // Repository.save persists the entity and returns the saved Student record with its generated ID
    const saved = await this.studentRepository.save(student);
    // TypeORM returns the single entity when a single entity is passed to save()
    return saved as unknown as Student;
  }

  /**
   * Updates an existing student record.
   * Fetches the updated record afterwards to return it to the client.
   */
  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    // Build the update object, converting dateOfBirth string → Date if provided
    const updateData: any = {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };
    // Repository.update updates rows matching the primary key directly in database
    await this.studentRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Deletes a student record.
   * Throws a NotFoundException if the student ID does not exist in the database.
   */
  async remove(id: number): Promise<void> {
    const result = await this.studentRepository.delete(id);
    if (result.affected === 0) { // If affected rows is 0, no record was found to delete
      throw new NotFoundException(`Student with ID ${id} not found`);
    }
  }
}
