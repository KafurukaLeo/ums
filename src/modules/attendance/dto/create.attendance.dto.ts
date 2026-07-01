/**
 * Data Transfer Object (DTO) for create.attendance.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class CreateAttendanceDto {
  /**
   * Foreign key link identifying the associated Course Enrollment.
   */
  @IsNotEmpty()
  @IsInt()
  enrollmentId: number;

  /**
   * Applicated timestamp or calendar date.
   */
  @IsNotEmpty()
  @IsDateString()
  date: string;

  /**
   * Current status category or enum state.
   */
  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
