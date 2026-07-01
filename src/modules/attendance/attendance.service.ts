/**
 * Module components file: attendance.service.ts.
 */
import { NotFoundException } from '../../common/exceptions/http.exception';
import { AppDataSource } from '../../database/connection';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create.attendance.dto';
import { UpdateAttendanceDto } from './dto/update.attendance.dto';

/**
 * Attendance Service class.
 * Handles database operations for recording student attendance in courses.
 */
export class AttendanceService {
  
  /**
   * Helper getter to resolve TypeORM repository for Attendance Entity.
   */
  private get attendanceRepository() {
    return AppDataSource.getRepository(Attendance);
  }

  /**
   * Fetch all attendance records in the database.
   */
  findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find();
  }

  /**
   * Fetch a single attendance record by ID.
   */
  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOneBy({ id });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  /**
   * Create and save a new attendance record.
   * Parses the string date into a JavaScript Date object.
   */
  create(data: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create({
      ...data,
      date: new Date(data.date),
    });
    return this.attendanceRepository.save(attendance);
  }

  /**
   * Update details of an existing attendance record.
   */
  async update(id: number, data: UpdateAttendanceDto): Promise<Attendance> {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    await this.attendanceRepository.update(id, updateData);
    return this.findOne(id);
  }

  /**
   * Delete an attendance record by ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.attendanceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
  }
}

// Export singleton instance of AttendanceService
export const attendanceService = new AttendanceService();
