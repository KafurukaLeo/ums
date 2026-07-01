/**
 * Data Transfer Object (DTO) for update.attendance.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class UpdateAttendanceDto {
  /**
   * Foreign key link identifying the associated Course Enrollment.
   */
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  /**
   * Applicated timestamp or calendar date.
   */
  @IsOptional()
  @IsDateString()
  date?: string;

  /**
   * Current status category or enum state.
   */
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
