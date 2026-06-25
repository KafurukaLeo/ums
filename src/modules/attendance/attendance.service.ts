import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create.attendance.dto';
import { UpdateAttendanceDto } from './dto/update.attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find();
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOneBy({ id });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  create(data: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({
      ...data,
      date: new Date(data.date),
    });
    return this.attendanceRepository.save(attendance);
  }

  async update(id: number, data: UpdateAttendanceDto): Promise<Attendance> {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    await this.attendanceRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.attendanceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
  }
}
