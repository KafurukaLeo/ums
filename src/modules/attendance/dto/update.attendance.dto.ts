/**
 * Data Transfer Object (DTO) for update.attendance.
 * Establishes validation constraints using class-validator annotations on incoming request payloads.
 */
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { AttendanceStatus } from '../../../common/constants/attendance.status.enum';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsInt()
  enrollmentId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
