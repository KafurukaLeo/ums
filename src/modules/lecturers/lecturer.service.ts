import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecturer } from './entities/lecturer.entity';
import { CreateLecturerDto } from './dto/create.lecturer.dto';
import { UpdateLecturerDto } from './dto/update.lecturer.dto';

@Injectable()
export class LecturerService {
  constructor(
    @InjectRepository(Lecturer)
    private readonly lecturerRepository: Repository<Lecturer>,
  ) {}

  findAll(): Promise<Lecturer[]> {
    return this.lecturerRepository.find();
  }

  async findOne(id: number): Promise<Lecturer> {
    const lecturer = await this.lecturerRepository.findOneBy({ id });
    if (!lecturer) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
    return lecturer;
  }

  async findByEmail(email: string): Promise<Lecturer | null> {
    return this.lecturerRepository.findOneBy({ email });
  }

  create(dto: CreateLecturerDto): Promise<Lecturer> {
    const lecturer = this.lecturerRepository.create(dto);
    return this.lecturerRepository.save(lecturer);
  }

  async update(id: number, dto: UpdateLecturerDto): Promise<Lecturer> {
    await this.lecturerRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.lecturerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lecturer with ID ${id} not found`);
    }
  }
}