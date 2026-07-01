/**
 * Module components file: lecturer.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Lecturer } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dto/create.lecturer.dto';
import { UpdateLecturerDto } from './dto/update.lecturer.dto';

/**
 * Lecturer Service class.
 * Handles database lookup and mutations for lecturer profile entities.
 */
export class LecturerService {
  
  /**
   * Helper getter to resolve TypeORM repository for Lecturer Entity.
   */
  private get lecturerRepository() {
    return AppDataSource.getRepository(Lecturer);
  }

  /**
   * Fetch all lecturer profiles.
   */
  findAll(): Promise<Lecturer[]> {
    return this.lecturerRepository.find();
  }

  /**
   * Fetch a single lecturer profile by ID.
   */
  async findOne(id: number): Promise<Lecturer> {
    const lecturer = await this.lecturerRepository.findOneBy({ id });
    if (!lecturer) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
    return lecturer;
  }

  /**
   * Look up lecturer profile by email address.
   */
  async findByEmail(email: string): Promise<Lecturer | null> {
    return this.lecturerRepository.findOneBy({ email });
  }

  /**
   * Create and save a new lecturer profile.
   */
  create(dto: CreateLecturerDto): Promise<Lecturer> {
    const lecturer = this.lecturerRepository.create(dto);
    return this.lecturerRepository.save(lecturer);
  }

  /**
   * Update lecturer profile details by ID.
   */
  async update(id: number, dto: UpdateLecturerDto): Promise<Lecturer> {
    await this.lecturerRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Delete lecturer profile by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.lecturerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
  }
}

// Export singleton instance of LecturerService
export const lecturerService = new LecturerService();